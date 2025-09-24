import CryptoJS from "crypto-js"

export function useLocalStorage(){
  const secretKey = process.env.VUE_STORAGE_ENCRYPTION_KEY;

  const encryptData = data => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  }

  const decryptData = encryptedData => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    }
  }

  const setLocalData = (key, value) => {
    localStorage.setItem(key, secretKey ? encryptData(value) : JSON.stringify(value));
  }

  const getLocalData = key => {
    const encryptedValue = localStorage.getItem(key);
    return encryptedValue ? (secretKey ? decryptData(encryptedValue) : JSON.parse(encryptedValue)) : null
  }

  const removeLocalData = key => {
    localStorage.removeItem(key);
  }

  return {setLocalData, getLocalData, removeLocalData, encryptData, decryptData}
}
