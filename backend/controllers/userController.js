const User = require("../models/User");
const Review = require("../models/Review");

// PUT /api/users/me
const updateProfile = async (req, res) => {
  try {
    const { name, bio, skillsCanTeach, skillsWantToLearn } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (skillsCanTeach !== undefined) user.skillsCanTeach = skillsCanTeach;
    if (skillsWantToLearn !== undefined) user.skillsWantToLearn = skillsWantToLearn;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Could not update profile", error: err.message });
  }
};

// GET /api/users  -> list all users except self, with optional skill search
const getAllUsers = async (req, res) => {
  try {
    const { skill } = req.query; // search by skill
    const filter = { _id: { $ne: req.user._id } };

    if (skill && skill.trim()) {
      const regex = new RegExp(skill.trim(), "i");
      filter.$or = [
        { skillsCanTeach: { $elemMatch: { $regex: regex } } },
        { skillsWantToLearn: { $elemMatch: { $regex: regex } } },
      ];
    }

    const users = await User.find(filter).limit(100);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch users", error: err.message });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // attach rating summary
    const reviews = await Review.find({ reviewee: user._id });
    const avg = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

    res.json({
      ...user.toJSON(),
      avgRating: Math.round(avg * 10) / 10,
      reviewCount: reviews.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch user", error: err.message });
  }
};

// GET /api/users/matches -> smart recommendation feed
const getMatches = async (req, res) => {
  try {
    const me = req.user;
    const others = await User.find({ _id: { $ne: me._id } });

    const normalize = (arr) => arr.map((s) => s.toLowerCase().trim());
    const myWantSet = new Set(normalize(me.skillsWantToLearn));
    const myTeachSet = new Set(normalize(me.skillsCanTeach));

    // Fetch ratings for all users
    const reviews = await Review.aggregate([
      { $group: { _id: "$reviewee", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const ratingMap = {};
    reviews.forEach((r) => { ratingMap[String(r._id)] = r; });

    const matches = others
      .map((other) => {
        const theirTeach = normalize(other.skillsCanTeach);
        const theirWant = normalize(other.skillsWantToLearn);

        const theyTeachWhatIWant = theirTeach.filter((s) => myWantSet.has(s));
        const theyWantWhatITeach = theirWant.filter((s) => myTeachSet.has(s));

        const skillScore = theyTeachWhatIWant.length * 2 + theyWantWhatITeach.length;
        const ratingData = ratingMap[String(other._id)];
        const ratingBonus = ratingData ? ratingData.avg * 0.5 : 0;
        const score = skillScore + ratingBonus;

        return {
          user: {
            ...other.toJSON(),
            avgRating: ratingData ? Math.round(ratingData.avg * 10) / 10 : 0,
            reviewCount: ratingData ? ratingData.count : 0,
          },
          theyCanTeachYou: theyTeachWhatIWant,
          youCanTeachThem: theyWantWhatITeach,
          isMutualSwap: theyTeachWhatIWant.length > 0 && theyWantWhatITeach.length > 0,
          score,
        };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);

    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: "Could not compute matches", error: err.message });
  }
};

module.exports = { updateProfile, getAllUsers, getUserById, getMatches };
