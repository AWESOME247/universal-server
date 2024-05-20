const userSchema = require("../../model");
// const postmark = require("postmark");
// const client = new postmark.ServerClient(process.env.POSTMARK);
const moment = require("moment");
const mail = require("../mail/withdrawal-template");
const sender = require("../mail/mail");

module.exports = async function (req, res) {
  const {id} = req.headers;

  const { amount, method } = req.body;
  
  // const { amount, method, otp } = req.body;

  try {
    const data = await userSchema.findById(id);

    // if (otp !== data.withdrawOTP) {
    //   return res.send({ error: "Invalid OTP!" });
    // }
    if (data.balance < amount) {
      return res.send({ error: "Insufficient Funds!" });
    }

    const user = await userSchema
      .findByIdAndUpdate(data._id, {
        balance: data.balance,
        withdrawAmount: parseInt(data.withdrawAmount) + parseInt(amount),
        withdrawMethod: method,
        $push: {
          transactions: {
            transactionType: "Withdraw",
            status: "pending",
            withdrawAmount: amount,
            withdrawMethod: method,
            date: moment().format("MMM Do YY"),
          },
        },
      })
      .exec();
    
    return res.send({ success: "Transaction successful" });

    // if (user) {
      // const data = await client.sendEmail({
      //   From: "Pending Withdrawal <support@ucmb.online>",
      //   To: user.email,
      //   Subject: "Withdrawal Request!",
      //   HtmlBody: mail(amount, user.fullname),
      // });
      // return res.send({ success: "Transaction successful" });
      // await sender(
      //   "Pending Withdrawal",
      //   "133fxtribeoption@gmail.com",
      //   "Withdrawal Request!",
      //   mail(amount, user.fullname))
      // .then(() => {
      //   return res.send({ success: "Transaction successful" });
      // })
      // .catch(console.error);
      // await client.sendEmail({
      //   From: "Pending Withdrawal <support@ucmb.online>",
      //   To: "support@remiinvestment.com",
      //   Subject: "Withdrawal Request!",
      //   HtmlBody: `Withdrawal Request!
      //   <br />
      //   <b> Name: ${user.fullname} </b>
      //   <br />
      //   <b>Amount: ${amount}</b>
      //   <br />
      //   <b>Country: ${user.country}</b>`,
      // });
    // }
  } catch (error) {
    res.send({ err: "Withdraw proccess Faild!" });
    console.log(error);
  }
};
