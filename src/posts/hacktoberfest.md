---
title: Hacktoberfest — get involved in OSS with jest-extended
date: "2017-10-23T22:12:03.284Z"
description: Want to get involved in open source software but don’t know where to begin? We’ve all been there!
image:
  src: /images/blog/hacktoberfest.jpg
  alt: "Mount tiede"
  credit:
    name: Meg Clark
    url: somewhere
---

Want to get involved in open source software but don’t know where to begin? We’ve all been there! Hacktoberfest is a great incentive for people to start contributing back to the OSS community and you can get yourself some free swag 👕. With the clock ticking down on Hacktoberfest — I’ve got a new open source project that you’re more than to contribute to! [jest-extended](https://github.com/mattphillips/jest-extended) 🎉

Do you use Facebook’s amazing testing library [Jest](jestjs.io)? If you haven’t then I definitely recommend you give it a try — amongst other things the developer experience of using it is second to none.

I recently found a feature of Jest that I thought was very cool!

---

### [`expect.extend(matchers)`](/)

You can use `expect.extend` to add your own matchers (assertions) to Jest. For example, let’s say you wanted to check a value is `true`. You could abstract that into a `toBeTrue` matcher:

```js[class=line-numbers]
expect.extend({
  toBeTrue(given) {
    const pass = given === true;
    if (pass) {
      return {
        message: () => `expected ${given} not to be true`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${given} to be true`,
        pass: false,
      };
    }
  },
});

test('true and false', () => {
  expect(true).toBeTrue();
  expect(false).not.toBeTrue();
});
```

---

This `extend` API got me thinking that it would be cool to have more specific Jest matchers. So I’ve decided to open source jest-extended as a new project to accomplish this.

In the spirit of Hacktoberfect I have created a series of [issues](/) for new matchers that I think would be useful to have as part of jest-extended but you can always raise an issue if you can think of others 🙂. I’ve labelled them with `New Matcher`, `Beginner Friendly` and `Hacktoberfest`.

Feel free to contribute by sending a pull request for any of the issues that aren’t already being worked on, just put a comment on the issue that you would like to work on it so that others don’t too. If you’re new to GitHub and sending pull requests, then I recommend you check out [Kent C. Dodds’s egghead course]() on contributing to open source projects.

Each new matcher should be beginner friendly and I’m more than happy to help out if you get stuck, so no excuses not to get involved 😜. A good place to start is the [contributing]() guide.

I look forward to seeing you over in the [**repo**]()!
