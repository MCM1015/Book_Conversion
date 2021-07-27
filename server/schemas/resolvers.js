const { User} = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user with this email found!');
      }

      const correctPasswd = await user.isCorrectPassword(password);

      if(!correctPasswd) {
        throw new AuthenticationError('Password is Incorrect');
      }

      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, { input: {authors, description, title, image, link} }, context) => {
    //saveBook
    if (context.user) {
      return User.findOneAndUpdate(
        {_id: context.user.id},
        {
          $addToSet: { savedBooks: { authors, description, title, image, link } },
        },
        {
        new: true,
        runValidators: true,
        }
      );
    }
    throw new AuthenticationError('You need to be logged in to save a book!');
    },
    removeBook: async(parent, {bookId}, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id},
          { $pull: { savedBooks: bookId }},
          { new: true }
        );
      }
      throw new AuthenticationError('You need to be logged in to remove a book');
    },
  },
};

module.exports = resolvers;