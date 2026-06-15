const characterSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?",
};

const secureRandomIndex = (max) => {
  if (!window.crypto?.getRandomValues) {
    throw new Error("Secure password generation is unavailable in this browser.");
  }

  const range = 0x100000000;
  const limit = Math.floor(range / max) * max;
  const values = new Uint32Array(1);
  do {
    window.crypto.getRandomValues(values);
  } while (values[0] >= limit);
  return values[0] % max;
};

const randomCharacter = (characters) =>
  characters[secureRandomIndex(characters.length)];

export const generatePassword = (options) => {
  const enabledSets = Object.entries(characterSets)
    .filter(([key]) => options[key])
    .map(([, characters]) => characters);

  if (enabledSets.length === 0) {
    throw new Error("Select at least one character type.");
  }
  if (options.length < enabledSets.length) {
    throw new Error("Password length is too short for the selected options.");
  }

  const allCharacters = enabledSets.join("");
  const password = enabledSets.map(randomCharacter);

  while (password.length < options.length) {
    password.push(randomCharacter(allCharacters));
  }

  for (let index = password.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomIndex(index + 1);
    [password[index], password[swapIndex]] = [password[swapIndex], password[index]];
  }

  return password.join("");
};
