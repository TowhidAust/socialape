let db = {
  users: [
      {
        userId: 'dh23ggj5h32g54yug34g',
        email: 'user@gmail.com',
        handle: 'user',
        createdAt: '2019-03-15T10:40:52.798Z',
        imageUrl: 'image/asfjhask/asljhf.png',
        bio: 'hello i am a fullstack developer',
        website: 'https://user.com',
        location: 'london, UK'
      }
  ],
  screams: [
    {
      userHandle: "user",
      body: "this is the scream body",
      createdAt: "2019-11-29T13:17:55.332Z",
      likeCount: 5,
      commentCount: 2,
    },
  ],
};

const userDetails = {
  // ?  redux data
  credentials: {
      userId: 'dh23ggj5h32g54yug34g',
      email: 'user@gmail.com',
      handle: 'user',
      createdAt: '2019-03-15T10:40:52.798Z',
      imageUrl: 'image/asfjhask/asljhf.png',
      bio: 'hello i am a fullstack developer',
      website: 'https://user.com',
      location: 'london, UK'
  },
  likes: [
    {
      userHandle: 'user',
      screamId: 'hh406Walsjlasdfasgasgr',
    },
    {
      userHandle: 'user',
      screamId: '3IOnAkdflskhflsfsadfase',
    }
  ]
}
