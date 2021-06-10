const axios = require("axios");

const cookie =
  "token=eyJ0b2tlbiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpwWkNJNklqWXdZV1UzT0dRM016TmpZelEwTURBeE9UbG1ZalJrWlNJc0ltVnRZV2xzSWpvaVlVQmhMbU52YlNJc0ltbGhkQ0k2TVRZeU1qQTBPRGt3T0N3aVpYaHdJam94TmpJeU1EUTVPREE0ZlEuTVJjYnJwbzJOLXJtN2xqZ1N2WWxmd1Y5aEtjUjMwY1luMDIxS1dJcVpzMCJ9; Path=/; Secure; HttpOnly;";
const makeRequests = async () => {
  try {
    let idx = 100;

    for (let i = 1; i <= idx; i++) {
      const ticket = await axios.post(
        "http://ticketing.com/api/ticket",
        { title: `Test ${i}`, price: 33 },
        { headers: { cookie } }
      );
      const id = ticket.data.data.id;
      await axios.put(
        `http://ticketing.com/api/ticket/${id}`,
        { title: `Test ${i}`, price: 20 },
        { headers: { cookie } }
      );
      axios.put(
        `http://ticketing.com/api/ticket/${id}`,
        { title: `Test ${i}`, price: 10 },
        { headers: { cookie } }
      );
      console.log(`SUCCESS: ${i}`);
    }
  } catch (error) {
    console.log(error.response.data);
  }
};

makeRequests();
