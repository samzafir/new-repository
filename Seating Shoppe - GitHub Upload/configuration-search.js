const fabricTags = [
  'oat beige tan cream bouclé boucle nubby textured woven',
  'forest green olive woven weave textured',
  'terracotta orange rust earthy linen woven',
  'ink navy blue charcoal dark velvet soft',
  'warm ivory white off white cream neutral smooth',
  'ochre mustard yellow gold tweed woven textured',
  'dusty rose pink muted blush soft',
  'silver gray grey woven weave textured',
  'cocoa brown chocolate linen woven',
  'moss green olive sage bouclé boucle nubby textured woven',
];

export const fabricDescription = item => item.description || fabricTags[Number(item.id.replace('fabric', ''))] || '';
const normalize = text => text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9 ]/g, ' ');
const tokens = text => normalize(text).trim().split(/\s+/).filter(Boolean);

export function fabricMatches(items, query) {
  const terms = tokens(query);
  return items.filter(item => {
    const tags = tokens(item.name + ' ' + fabricDescription(item));
    return terms.every(term => tags.some(tag => tag.startsWith(term)));
  });
}

const textures = /\b(boucle|velvet|linen|tweed|weave|woven|nubby|smooth|textured)\b/;
const colors = /\b(beige|cream|green|olive|orange|rust|navy|blue|charcoal|ivory|white|yellow|gold|pink|blush|gray|grey|silver|brown|chocolate|sage|black|red|purple)\b/;
const aliases = { woven:'weave', grey:'gray' };

export function interpretConfiguration(prompt, catalog, parts, fabrics, finishes, current, suggested) {
  const text = normalize(prompt.replace(/[,;]/g, " nextfabricclause "));
  const has = pattern => pattern.test(text);
  const named = [...catalog].sort((a,b)=>b.name.length-a.name.length).find(item => new RegExp('\\b'+normalize(item.name).replace(/ chair$/, '').replace(/ +/g,' +')+'\\b').test(text));
  const silhouette = has(/\b(cutout|cut out|opening|keyhole)\b/) ? 'aperture-chair'
    : has(/\b(slat|top rail)\b/) ? 'tau-chair' : has(/\brounded back\b/) ? 'parigi-side-chair' : undefined;
  const backStyle = has(/\btuft(?:ed|ing)\b/) ? 'tufted' : has(/\b(original|standard) back\b/) ? 'original' : undefined;
  const seatStyle = has(/\b(pullover|pull over)\b/) ? 'alternate' : has(/\bboxed seat\b/) ? 'original' : undefined;
  const compatible = item => (!backStyle || backStyle === 'original' || parts[item.id].alternateBack)
    && (!seatStyle || seatStyle === 'original' || parts[item.id].alternateSeat);
  const match = named ?? catalog.find(item => item.id === silhouette) ?? suggested
    ?? (compatible(current) ? current : catalog.find(compatible)) ?? current;
  const changes = {};
  const warnings = [];
  if (backStyle) {
    if (parts[match.id].alternateBack) changes.backStyle = backStyle;
    else warnings.push('That back style is unavailable on '+match.name+'.');
  }
  if (seatStyle) {
    if (parts[match.id].alternateSeat) changes.seatStyle = seatStyle;
    else warnings.push('That seat style is unavailable on '+match.name+'.');
  }
  if (has(/\b(arms?|armrests?|sled|casters?)\b/)) warnings.push('Arm and base changes are unavailable for these models.');
  if (has(/\b(handhold|glides?|nailheads?|welted|webbed seat)\b/)) warnings.push('See the product options for those details. They are listed for reference.');
  const finish = finishes.map(([name],i)=>({i, key:normalize(name).trim()}))
    .filter(({key})=>(' '+text+' ').includes(' '+key+' ')).sort((a,b)=>b.key.length-a.key.length)[0]?.i ?? -1;
  if (finish >= 0) changes.finish = finish;
  const fabricText = finish < 0 ? text : text.replace(normalize(finishes[finish][0]), ' ');
  const clauses = fabricText.split(/\band\b|\bwith\b|\bnextfabricclause\b/);
  for (const clause of clauses) {
    const exact = fabrics.find(item => clause.includes(normalize(item.name)));
    const specs = [clause.match(colors)?.[0], clause.match(textures)?.[0]].filter(Boolean);
    if (!exact && !specs.length) continue;
    const chosen = exact ?? fabricMatches(fabrics, specs.map(word => aliases[word] ?? word).join(' '))[0];
    if (!chosen) {
      warnings.push('No curated fabric matches '+specs.join(' ')+'.');
      continue;
    }
    const seat = /\bseat\b/.test(clause);
    const back = /\bback\b/.test(clause);
    const textileBack = Boolean(parts[match.id].back);
    if (!back || seat) changes.seat = chosen.id;
    if (textileBack && (!seat || back)) changes.back = chosen.id;
    if (back && !textileBack) warnings.push(match.name+' has a wood back.');
  }
  return { match, changes, warnings };
}

