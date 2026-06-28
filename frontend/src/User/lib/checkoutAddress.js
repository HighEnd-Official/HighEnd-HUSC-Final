const STORAGE_KEY = "hues_checkout_address_v1";

const defaultAddress = {
  name: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  country: "Sri Lanka",
};

function getUserAddressKey(user) {
  return user?.id || user?.email || "guest";
}

function getProfileAddress(user) {
  return {
    name: user?.username || "",
    phone: user?.phone || "",
    email: user?.email || "",
    addressLine1: user?.addressLine1 || "",
    addressLine2: user?.addressLine2 || "",
    city: user?.city || "",
    postalCode: user?.postalCode || "",
    country: user?.country || "Sri Lanka",
  };
}

function readStoredAddresses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStoredAddresses(addressBook) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addressBook));
}

export function getDefaultCheckoutAddress() {
  return { ...defaultAddress };
}

export function loadCheckoutAddress(user) {
  const addressBook = readStoredAddresses();
  const savedAddress = addressBook[getUserAddressKey(user)];
  return {
    ...defaultAddress,
    ...(savedAddress || {}),
    ...getProfileAddress(user),
  };
}

export function saveCheckoutAddress(user, address) {
  const addressBook = readStoredAddresses();
  addressBook[getUserAddressKey(user)] = {
    ...defaultAddress,
    ...(address || {}),
  };
  writeStoredAddresses(addressBook);
}

export function hasCompleteCheckoutAddress(address) {
  return Boolean(
    String(address?.addressLine1 || "").trim() &&
    String(address?.city || "").trim() &&
    String(address?.postalCode || "").trim() &&
    String(address?.country || "").trim()
  );
}
