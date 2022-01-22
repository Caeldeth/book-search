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

        // next mutation if needed
    },
};

module.exports = resolvers;
