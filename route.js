const { addSchedule, 
    getAllSchedules, 
    getNearestSchedule, 
    toggleSchedule} = require("./handler");

const routes = [
    {
        method: "POST",
        path: "/schedule",
        handler: addSchedule,
    },
    {
        method: "GET",
        path: "/schedule",
        handler: getAllSchedules,
    },
    {
        method: "POST",
        path: "/schedule/nearest",
        handler: getNearestSchedule,
        options: {
          payload: {
            allow: "application/json",
          },
        },
      },
      {
        method: 'POST',
        path: '/schedule/toggle',
        handler: toggleSchedule,
      },
];

module.exports = routes;
