// const mongoose=require('mongoose')
// const bcrypt=require('bcrypt')
// const validator=require('validator')
// const Schema=mongoose.Schema

// const userSchema=new Schema({
//     email:{
//         type:String,
//         required:true,
//         unique:true
//     },
//     password:{
//         type:String,
//         required:true,
//     }
// })
// //static signup 
// userSchema.statics.signup=async function(email,password){

//     if(!email || !password){
//         throw Error('All fields are necessary')
//     }
//     if(!validator.isEmail(email)){
//         throw Error("Email is not valid")
//     }
//     if(!validator.isStrongPassword(password)){
//         throw Error('Password is too weak')
//     }
//     const exists=await this.findOne({email})
//     if(exists){
//         throw Error('Email already in use')
//     }


//     const salt=await bcrypt.genSalt(10)
//     const hash=await bcrypt.hash(password,salt)

//     const user=await this.create({email,password:hash})

//     return user

// }


// //static login method
// userSchema.statics.login=async function(email,password){
//     if(!email || !password){
//         throw Error('All fields are necessary')
//     }
//     const user=await this.findOne({email})
//     if(!user){
//         throw Error('Incorrect email')
//     }
//     const match=await bcrypt.compare(password,user.password)
//     if(!match){
//         throw Error('Incorrect Password')
//     }
//     return user

// }
// module.exports=mongoose.model('User',userSchema)   
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return !this.googleId && !this.githubId; } },
  googleId: { type: String, unique: true, sparse: true },
  githubId: { type: String, unique: true, sparse: true },
  name: { type: String },
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' }, // ✅ Add this
  profileComplete: { type: Boolean, default: false }
});


// static signup
userSchema.statics.signup = async function(email, password) {
    if (!email || !password) {
        throw Error('All fields are necessary');
    }
    if (!validator.isEmail(email)) {
        throw Error("Email is not valid");
    }
    if (!validator.isStrongPassword(password)) {
        throw Error('Password is too weak');
    }
    const exists = await this.findOne({ email });
    if (exists) {
        throw Error('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await this.create({ email, password: hash });
    return user;
};

// static login method
userSchema.statics.login = async function(email, password) {
    if (!email || !password) {
        throw Error('All fields are necessary');
    }
    const user = await this.findOne({ email });
    if (!user) {
        throw Error('Incorrect email');
    }
    // Cannot log in with password if registered via OAuth
    if (!user.password) {
        throw Error('This account was registered via a social provider. Please use Google or GitHub to log in.');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw Error('Incorrect Password');
    }
    return user;
};

module.exports = mongoose.model('User', userSchema);