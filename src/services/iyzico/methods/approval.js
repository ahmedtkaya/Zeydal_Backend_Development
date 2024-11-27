import iyzipay from "../connection/iyzipay";

export const approvePayment = (data) => {
  return new Promise((resolve, reject) => {
    iyzipay.approval.create(data, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export const disApprovePayment = (data) => {
  return new Promise((resolve, reject) => {
    iyzipay.disapproval.create(data, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
