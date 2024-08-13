import iyzipay from "../connection/iyzipay";

export const createUserCard = async (data) => {
  return new Promise((resolve, reject) => {
    iyzipay.card.create(data, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export const getUserCards = async (data) => {
  return new Promise((resolve, reject) => {
    iyzipay.cardList.retrieve(data, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export const deleteUserCard = async (data) => {
  return new Promise((resolve, reject) => {
    iyzipay.card.delete(data, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
