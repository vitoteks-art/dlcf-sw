export const createFollowupContact = (decisionType = "visitor") => ({
  full_name: "",
  phone: "",
  email: "",
  gender: "",
  decision_type: decisionType,
  category: "",
  address: "",
  notes: "",
  consent_to_contact: true,
});

export function cleanFollowupContacts(contacts = []) {
  return contacts
    .filter((contact) => String(contact.full_name || "").trim() !== "")
    .map((contact) => ({
      ...contact,
      full_name: String(contact.full_name || "").trim(),
      consent_to_contact: contact.consent_to_contact !== false,
    }));
}
