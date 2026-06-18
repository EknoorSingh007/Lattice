const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

// Google Auth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    const token = createToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?token=${token}&email=${req.user.email}&id=${req.user._id}&profileComplete=${req.user.profileComplete}`);
});

// GitHub Auth
router.get('/github', passport.authenticate('github', {
    scope: ['user:email']
}));

router.get('/github/callback', passport.authenticate('github', { session: false }), (req, res) => {
    const token = createToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?token=${token}&email=${req.user.email}&id=${req.user._id}`);
});

module.exports = router;