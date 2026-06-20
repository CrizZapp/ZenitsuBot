const normalize = (id = "") =>
  String(id)
    .split("@")[0]
    .split(":")[0];

export const owners = new Set([
  "212210794119298",
  "6288211478237",
  "584166342904"
]);

export const isOwner = (sender) => {
  const id = normalize(sender);

  return {
    check: owners.has(id),
    name: id
  };
};
