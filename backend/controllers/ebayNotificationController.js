const crypto = require("crypto");

// ========================================
// Verification Challenge
// ========================================

exports.verification = async (req, res) => {
  try {
    const challengeCode = req.query.challenge_code;

    if (!challengeCode) {
      return res.status(400).json({
        success: false,
        message: "Missing challenge_code",
      });
    }

    const verificationToken =
      process.env.EBAY_VERIFICATION_TOKEN;

    const endpoint =
      process.env.EBAY_NOTIFICATION_ENDPOINT;

    const hash = crypto
      .createHash("sha256")
      .update(
        challengeCode +
          verificationToken +
          endpoint
      )
      .digest("hex");

    return res.status(200).json({
      challengeResponse: hash,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// Receive Notifications
// ========================================

exports.receiveNotification = async (
  req,
  res
) => {
  try {
    console.log(
      "====== EBAY NOTIFICATION ======"
    );

    console.log(req.body);

    return res.status(200).send("OK");
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};