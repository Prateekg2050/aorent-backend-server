import FCM from 'fcm-node';

export const sendNotification = (token) => {
  let serverKey = process.env.FIREBASE_SEVER_KEY;
  let fcm = new FCM(serverKey);

  let message = {
    to: token,
    notification: {
      title: 'NotifcatioTestAPP',
      body: '{"Message from node js app"}',
    },

    data: {
      // you can send only notification or only data(or include both)
      title: 'ok cdfsdsdfsd',
      body: '{"name" : "okg ooggle ogrlrl","product_id" : "123","final_price" : "0.00035"}',
    },
  };

  fcm.send(message, function (err, response) {
    if (err) {
      console.log('Something has gone wrong!' + err);
      console.log('Response:! ' + response);
    } else {
      console.log('Successfully sent with response: ', response);
    }
  });
};
