const crypto = require("crypto");
const SECRET = crypto.randomBytes(32); // AES-256 Key
const IV_LENGTH = 16;

module.exports = {
    encrypt(text) {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv("aes-256-cbc", SECRET, iv);
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");
        return iv.toString("hex") + ":" + encrypted;
    },

    decrypt(text) {
        const parts = text.split(":");
        const iv = Buffer.from(parts.shift(), "hex");
        const encryptedText = parts.join(":");
        const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET, iv);
        let decrypted = decipher.update(encryptedText, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }
};
