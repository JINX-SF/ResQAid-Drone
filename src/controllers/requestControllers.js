exports.getRequestById = async (req, res) => {
  const request = await Request.findById(req.params.id)
    .populate("user");

  res.json({
    success: true,
    data: request,
  });
};

exports.acceptRequest = async (req, res) => {
  const request = await Request.findByIdAndUpdate(
    req.params.id,
    {
      status: "accepted",
    },
    { new: true }
  );

  res.json({
    success: true,
    data: request,
  });
};

exports.rejectRequest = async (req, res) => {
  const request = await Request.findByIdAndUpdate(
    req.params.id,
    {
      status: "rejected",
    },
    { new: true }
  );

  res.json({
    success: true,
    data: request,
  });
};