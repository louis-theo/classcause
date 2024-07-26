const wishlistItems = [
  {
    teacherId: 1,
    storiesId: null,
    code: "1q2w3e",
    name: "Lab Equipment",
    goalValue: 1200.0,
    status: "active",
    deadline: "2024-10-15 23:59:59",
    description: "Funds for new chemistry lab equipment.",
    platformFulfillment: false,
    endDate: "2024-10-15 23:59:59",
    currentValue: 500.0,
    creationTime: new Date(2024, 1, 17),
    image: "https://m.media-amazon.com/images/I/714tx9QbaKL._AC_SX679_.jpg",
  },
  {
    teacherId: 1,
    storiesId: null,
    code: "2w3e4r",
    name: "Field Trip",
    goalValue: 1000.0,
    status: "active",
    deadline: "2024-05-30 23:59:59",
    description: "Funding for a field trip to the science museum.",
    platformFulfillment: false,
    endDate: "2024-05-30 23:59:59",
    currentValue: 750.0,

    creationTime: new Date(2023, 1, 17),
    image:
      "https://1990171352.rsc.cdn77.org/media/1399/sience-museum.jpg?anchor=center&mode=crop&width=767&rnd=133017518380000000",
  },
  {
    teacherId: 1,
    storiesId: 9,
    code: "123ert",
    name: "Sports Gear",
    goalValue: 800.0,
    status: "completed",
    deadline: "2024-08-01 23:59:59",
    description: "New sports equipment for the school team.",
    platformFulfillment: true,
    isDispatched: true,
    endDate: "2024-08-01 23:59:59",
    currentValue: 700.0,

    creationTime: new Date(2024, 1, 7),
    image:
      "https://www.live4sport.co.uk/media/catalog/product/cache/4f4f05059d42204fbf0c36388289a0dc/s/e/se1232-05-09.jpg",
  },
  {
    teacherId: 1,
    storiesId: 1,
    code: "asde45",
    name: "Music Instruments",
    goalValue: 2000.0,
    status: "underfunded",
    deadline: "2024-12-20 23:59:59",
    description: "Instruments for the school band.",
    platformFulfillment: false,
    endDate: "2024-12-20 23:59:59",
    currentValue: 1000.0,

    creationTime: new Date(2024, 1, 7),
    image: "https://m.media-amazon.com/images/I/711mOOstnsL.jpg",
  },
  {
    teacherId: 2,
    storiesId: null,
    code: "fgh567",
    name: "Book Club",
    goalValue: 300.0,
    status: "active",
    deadline: "2024-09-10 23:59:59",
    description: "Books for the after-school book club.",
    platformFulfillment: true,
    isDispatched: false,
    endDate: "2024-09-10 23:59:59",
    currentValue: 150.0,

    creationTime: new Date(2024, 2, 17),
    image:
      "https://static.standard.co.uk/2022/06/29/16/lifestylejpg-1.?width=1200&auto=webp&quality=75",
  },
  {
    teacherId: 17,
    storiesId: null,
    code: "345ttg",
    name: "Tech Upgrade",
    goalValue: 2500.0,
    status: "active",
    deadline: "2024-11-25 23:59:59",
    description: "Upgrading computer lab hardware.",
    platformFulfillment: false,
    isDispatched: true,
    endDate: "2024-11-25 23:59:59",
    currentValue: 1250.0,

    creationTime: new Date(2024, 3, 17),
    image: "https://m.media-amazon.com/images/I/811A5xhCQtL.jpg",
  },
  {
    teacherId: 13,
    storiesId: 6,
    code: "12erty",
    name: "Art Supplies",
    goalValue: 600.0,
    status: "completed",
    deadline: "2024-03-15 23:59:59",
    description: "Supplies for the art class to support creativity.",
    platformFulfillment: true,
    endDate: "2024-03-15 23:59:59",
    currentValue: 600.0,

    creationTime: new Date(2024, 3, 17),
    image: "https://m.media-amazon.com/images/I/91t3uSVn5xS.jpg",
  },
  {
    teacherId: 1,
    storiesId: 7,
    code: "56yhnj",
    name: "Library Books",
    goalValue: 1200.0,
    status: "completed",
    deadline: "2024-06-30 23:59:59",
    description: "Expanding the library's collection of books.",
    platformFulfillment: true,
    isDispatched: true,
    endDate: "2024-06-30 23:59:59",
    currentValue: 1200.0,
    creationTime: new Date(2024, 3, 17),
    image: "https://d16z75xe786dp.cloudfront.net/files/2012/04/library.jpg",
  },
  {
    teacherId: 13,
    storiesId: 3,
    code: "u78ikm",
    name: "Science Lab Materials",
    goalValue: 1800.0,
    status: "completed",
    deadline: "2024-07-20 23:59:59",
    description: "Materials for hands-on science experiments.",
    platformFulfillment: true,
    isDispatched: false,
    endDate: "2024-07-20 23:59:59",
    currentValue: 1800.0,
    creationTime: new Date(2024, 3, 17),
    image:
      "https://cdn11.bigcommerce.com/s-ufhcuzfxw9/images/stencil/500x659/n/th-chemistry-lab-burners-hot-plates-lamps__61015.original.jpg",
  },
  {
    teacherId: 1,
    storiesId: 5,
    code: "olp09o",
    name: "Classroom iPads",
    goalValue: 2200.0,
    status: "completed",
    deadline: "2024-08-15 23:59:59",
    description: "iPads for classroom interactive learning.",
    platformFulfillment: true,
    isDispatched: false,
    endDate: "2024-08-15 23:59:59",
    currentValue: 2200.0,
    creationTime: new Date(2024, 3, 17),
    image:
      "https://ipoint.ae/cdn/shop/products/96fe9170-408c-48f5-9a4e-b1a994534149.jpg?v=1671619852",
  },
  {
    teacherId: 9,
    storiesId: 2,
    code: "plmzaq",
    name: "Digital Whiteboards",
    goalValue: 3000.0,
    status: "completed",
    deadline: "2024-09-05 23:59:59",
    description: "Interactive whiteboards for engaging lessons.",
    platformFulfillment: true,
    isDispatched: true,
    endDate: "2024-09-05 23:59:59",
    currentValue: 3000.0,
    creationTime: new Date(2024, 3, 17),
    image:
      "https://vibe.us/blog/interactive-whiteboard-what-is-it-and-what-does-it-do/cover_hue10e92cad5f9482adf1314f69bde6c61_282635_1280x0_resize_q90_h2_lanczos_3.3be5fa850dc9f98b3179b801ccdc760de3692078e7fe8e0aad220a9b32d258a1.webp",
  },
  {
    teacherId: 13,
    storiesId: 8,
    code: "wsxcde",
    name: "Geography Trip",
    goalValue: 5000.0,
    status: "completed",
    deadline: "2024-10-01 23:59:59",
    description: "Funding for a field trip..",
    platformFulfillment: true,
    isDispatched: false,
    endDate: "2024-10-01 23:59:59",
    currentValue: 5000.0,
    creationTime: new Date(2024, 3, 17),
    image:
      "https://www.tripsavvy.com/thmb/CaebUvS1qtK4HJUDzLX31GY7buE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-4540860191-59930af8396e5a0010a21cde.jpg",
  },

  {
    teacherId: 17,
    storiesId: null,
    code: "edcrfv",
    parentId: 4,
    name: "Mathematics Kits",
    goalValue: 800.0,
    status: "suggestion",
    deadline: "2024-12-15 23:59:59",
    description: "Kits for practical mathematics learning.",
    platformFulfillment: false,
    isDispatched: false,
    votingNum: 100,
    endDate: "2024-12-15 23:59:59",
    currentValue: 0.0,
    creationTime: new Date(2024, 3, 17),
    image:
      "https://www.hand2mind.com/media/catalog/product/2/4/24e5781699b41adfc1bf316b2247b9a4b438d280.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=480&width=480&canvas=480:480",
  },

  {
    teacherId: 1,
    storiesId: 4,
    code: "edcrfv",
    name: "History Trip",
    goalValue: 800.0,
    status: "completed",
    deadline: "2024-12-15 23:59:59",
    description: "Funding for history trip.",
    platformFulfillment: true,
    isDispatched: true,
    endDate: "2024-12-15 23:59:59",
    currentValue: 800.0,
    image:
      "https://www.english-heritage.org.uk/siteassets/home/learn/school-visits/top-10-school-trips/4-osborne.jpg?w=640&mode=none&scale=downscale&quality=60&anchor=&WebsiteVersion=20240220070057",
  },
  {
    teacherId: 1,
    storiesId: null,
    code: "edcrfv",
    name: "Ski Trip",
    parentId: 3,
    goalValue: 8000.0,
    status: "suggestion",
    deadline: "2024-12-15 23:59:59",
    description: "test",
    platformFulfillment: false,
    isDispatched: false,
    votingNum: 100,
    endDate: "2024-12-15 23:59:59",
    currentValue: 0.0,
    image:
      "https://www.snowmagazine.com/images/features/focus-on/how-to-plan-the-perfect-group-ski-trip.jpg",
  },
];

module.exports = wishlistItems;
