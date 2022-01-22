const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require ('../models');
const { signToken } = require ('../utils/auth');

const resolvers = {
    Query: {
        me: async(parent, args, context) => {
            if (context.user) {
            const userData = await User.findOne({ _id: context.user._id})
                .select('-__v -password')
                .populate('book')
            return userData;
            }
            throw new AuthenticationError('Not logged in');
        },

        // next query if needed
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args)
            const token = signToken(user)

            return { token, user }
        },

        login: async(parent, { email, password }) => {
            const user = await User.findOne({ email })

            if(!user) {
                throw new AuthenticationError('Email or Password Incorrect');
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw) {
                throw new AuthenticationError('Email or Password Incorrect');
            }

            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, args, context) => {
            if(context.user) {
                const newBook = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: args.input } },
                    { new: true, runValidators: true }
                );

                return newBook;
            };
            
            throw new AuthenticationError('You must be logged in to save a book');
        },

        removeBook: async (parent, args, context) => {
            if(context.user) {
                const remBook = await User.findOneAndUpdate(
                    { _id: context.user_id },
                    { $pull: { savedBooks: { bookId: args.bookId } } },
                    { new: true }
                );
                return remBook
            };

            throw new AuthenticationError('You must be logged in to remove a book');
        }
        // next mutation if needed
    },
};

module.exports = resolvers;
