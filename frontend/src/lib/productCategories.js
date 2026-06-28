export const CATEGORY_GROUPS = [
  {
    label: "Dresses",
    route: "/collections/dress",
    aliases: ["dress", "dresses"],
    subcategories: ["Mini Dresses", "Midi Dresses", "Maxi Dresses"],
  },
  {
    label: "Tops",
    route: "/collections/blouse",
    aliases: ["top", "tops", "blouse", "blouses"],
    subcategories: ["Short Sleeved Tops", "Long Sleeved Tops", "Sleeveless Tops", "Crop Tops", "Tank Tops", "Crochet Tops"],
  },
  {
    label: "Shirts",
    route: "/collections/shirt",
    aliases: ["shirt", "shirts"],
    subcategories: [],
  },
  {
    label: "Skirts",
    route: "/collections/skirts",
    aliases: ["skirt", "skirts"],
    subcategories: ["Mini Skirts", "Midi Skirts", "Maxi Skirts"],
  },
  {
    label: "Pants",
    route: "/collections/pants",
    aliases: ["pant", "pants", "trouser", "trousers"],
    subcategories: [],
  },
  {
    label: "Indian Ethnic Wear",
    route: "/collections/lehenga",
    aliases: ["indian ethnic wear", "ethnic wear", "lehenga", "lehengas"],
    subcategories: ["Short Kurtis", "Mid Kurtis", "Long Kurtis", "Kurti Sets", "Kurti Pants"],
  },
  {
    label: "Footwear",
    route: "/collections/footwear",
    aliases: ["footwear", "shoe", "shoes"],
    subcategories: ["Flats", "Indian Jutti"],
  },
  {
    label: "Accessories",
    route: "/collections/accessories",
    aliases: ["accessory", "accessories"],
    subcategories: ["Bangles", "Earrings", "Necklaces"],
  },
];

export const CATEGORY_OPTIONS = CATEGORY_GROUPS.map((group) => group.label);

export const SUBCATEGORY_OPTIONS_BY_CATEGORY = Object.fromEntries(
  CATEGORY_GROUPS.map((group) => [group.label, group.subcategories])
);

const GROUP_BY_LABEL = new Map(CATEGORY_GROUPS.map((group) => [group.label.toLowerCase(), group]));
const GROUP_BY_ALIAS = new Map(
  CATEGORY_GROUPS.flatMap((group) => [
    [group.label.toLowerCase(), group],
    ...group.aliases.map((alias) => [alias.toLowerCase(), group]),
  ])
);
const SUBCATEGORY_TO_GROUP = new Map(
  CATEGORY_GROUPS.flatMap((group) =>
    group.subcategories.map((subcategory) => [subcategory.toLowerCase(), group])
  )
);

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function splitCategoryValue(value) {
  const raw = String(value || "").trim();
  if (!raw) return { main: "", sub: "" };

  const separatorMatch = raw.match(/\s*(?:→|â†’|>|\/)\s*/);
  if (!separatorMatch) return { main: raw, sub: "" };

  const [main, sub] = raw.split(separatorMatch[0]);
  return {
    main: String(main || "").trim(),
    sub: String(sub || "").trim(),
  };
}

function resolveGroup(value) {
  const normalized = normalizeText(value);
  return GROUP_BY_ALIAS.get(normalized) || GROUP_BY_LABEL.get(normalized) || null;
}

function resolveSubcategory(value) {
  const normalized = normalizeText(value);
  for (const group of CATEGORY_GROUPS) {
    const match = group.subcategories.find((subcategory) => normalizeText(subcategory) === normalized);
    if (match) return match;
  }
  return String(value || "").trim();
}

export function getCategoryGroup(identifier) {
  const normalized = normalizeText(identifier);
  return (
    GROUP_BY_ALIAS.get(normalized) ||
    GROUP_BY_LABEL.get(normalized) ||
    CATEGORY_GROUPS.find((group) => normalizeText(group.route) === normalized) ||
    null
  );
}

export function getSubcategoriesForCategory(category) {
  return getCategoryGroup(category)?.subcategories || [];
}

export function getCategoryRoute(category) {
  return getCategoryGroup(category)?.route || "";
}

export function normalizeProductCategory(category) {
  const raw = String(category || "").trim();
  if (!raw) return "";

  const split = splitCategoryValue(raw);
  const resolvedGroup = resolveGroup(split.main) || resolveGroup(raw);
  if (resolvedGroup) return resolvedGroup.label;

  const subMatchGroup = SUBCATEGORY_TO_GROUP.get(normalizeText(split.main)) || SUBCATEGORY_TO_GROUP.get(normalizeText(raw));
  if (subMatchGroup) return subMatchGroup.label;

  return raw;
}

export function normalizeProductSubcategory(subcategory, category) {
  const rawSubcategory = String(subcategory || "").trim();
  if (rawSubcategory) {
    const resolved = resolveSubcategory(rawSubcategory);
    return SUBCATEGORY_TO_GROUP.has(normalizeText(resolved)) ? resolved : "";
  }

  const split = splitCategoryValue(category);
  if (split.sub) {
    return resolveSubcategory(split.sub);
  }

  const group = resolveGroup(split.main) || resolveGroup(category);
  if (group) {
    const raw = String(category || "").trim();
    const matched = group.subcategories.find((item) => normalizeText(raw) === normalizeText(item));
    if (matched) return matched;
  }

  return "";
}

export function getCategoryBySubcategory(subcategory) {
  return SUBCATEGORY_TO_GROUP.get(normalizeText(subcategory)) || null;
}

export function categoryMatchTerms(categoryKey, subcategoryKey = "") {
  const key = normalizeText(categoryKey);
  const subKey = normalizeText(subcategoryKey);
  const group = getCategoryGroup(categoryKey) || getCategoryBySubcategory(categoryKey);

  if (!group) {
    return { exact: [key], keywords: [key] };
  }

  const exact = [group.label];
  const keywords = [...group.aliases, group.label];

  if (subKey) {
    const subcategory = group.subcategories.find((item) => normalizeText(item) === subKey) || subcategoryKey;
    return {
      exact: [group.label, subcategory],
      keywords: [...keywords, subcategory],
    };
  }

  const matchedSubcategory = group.subcategories.find((item) => normalizeText(item) === key);
  if (matchedSubcategory) {
    return {
      exact: [group.label, matchedSubcategory],
      keywords: [...keywords, matchedSubcategory],
    };
  }

  return { exact, keywords };
}
