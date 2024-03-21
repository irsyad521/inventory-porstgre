import User from '../../api/models/model.user.js';

export async function createTestUser(username, password) {
    await User.create({
        username,
        email: `${username}@example.com`,
        password,
    });
}

export async function removeTestUser(username) {
    await User.deleteOne({ username });
}
