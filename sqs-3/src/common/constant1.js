const constants = {
    maxNumberOfQueues: 4,
    maxNoOfPhotosSelectable: 50,
    maxNoOfPhotosUploadable: 10,
    maxNoOfVideosSelectable: 20,
    maxNoOfVideosUploadable: 3,
    maxNumberOfPeople: 99,
    maxNumberOfCounters: 12,
    styles: {
      queueItems: [
        {
          name: {
            backgroundColor: '#59d297',
          },
          ticketNumber: {
            backgroundColor: '#69F0AE',
          },
        },
        {
          name: {
            backgroundColor: '#de9538',
          },
          ticketNumber: {
            backgroundColor: '#FFAB40',
          },
        },
        {
          name: {
            backgroundColor: '#35a0d0',
          },
          ticketNumber: {
            backgroundColor: '#40C4FF',
          },
        },
        {
          name: {
            backgroundColor: '#dab836',
          },
          ticketNumber: {
            backgroundColor: '#FFD740',
          },
        },
        {
          name: {
            backgroundColor: '#c55832',
          },
          ticketNumber: {
            backgroundColor: '#FF6E40',
          },
        },
        {
          name: {
            backgroundColor: '#17c4c4',
          },
          ticketNumber: {
            backgroundColor: '#18FFFF',
          },
        },
      ],
    },
    ticketStatuses: [
      {
        text: '排隊中',
        value: 'pending',
      },
      {
        text: '已入座',
        value: 'processed'
      },
      {
        text: '沒有出現',
        value: 'called',
      },
    ],
    reasonsToStopGetTicket: [{
      text: '暫停',
      value: 'pause',
    }, {
      text: '未滿座',
      value: 'preparing',
      photoUrl: './images/preparing.jpg',
    }, {
      text: '落場',
      value: 'waiting',
      photoUrl: './images/waiting.jpg'
    }],
    callingSounds: [
      {
        type: 'ding',
        fileName: 'ding.wav'
      },
      {
        type: 'next',
        fileName: 'next.wav',
        lang: 'zhHK',
      },
      {
        type: 'A',
        fileName: 'A.wav',
        lang: 'zhHK',
      },
      {
        type: 'B',
        fileName: 'B.wav',
        lang: 'zhHK',
      },
      {
        type: 'C',
        fileName: 'C.wav',
        lang: 'zhHK',
      },
      {
        type: 'D',
        fileName: 'D.wav',
        lang: 'zhHK',
      },
      {
        type: 0,
        fileName: '0.wav',
        lang: 'zhHK',
      },
      {
        type: 1,
        fileName: '1.wav',
        lang: 'zhHK',
      },
      {
        type: 2,
        fileName: '2.wav',
        lang: 'zhHK',
      },
      {
        type: 3,
        fileName: '3.wav',
        lang: 'zhHK',
      },
      {
        type: 4,
        fileName: '4.wav',
        lang: 'zhHK',
      },
      {
        type: 5,
        fileName: '5.wav',
        lang: 'zhHK',
      },
      {
        type: 6,
        fileName: '6.wav',
        lang: 'zhHK',
      },
      {
        type: 7,
        fileName: '7.wav',
        lang: 'zhHK',
      },
      {
        type: 8,
        fileName: '8.wav',
        lang: 'zhHK',
      },
      {
        type: 9,
        fileName: '9.wav',
        lang: 'zhHK',
      },
      {
        type: 'counter1',
        fileName: 'counter1.wav',
        lang: 'zhHK',
      },
      {
        type: 'counter2',
        fileName: 'counter2.wav',
        lang: 'zhHK',
      },
      {
        type: 'counter3',
        fileName: 'counter3.wav',
        lang: 'zhHK',
      },
      {
        type: 'counter4',
        fileName: 'counter4.wav',
        lang: 'zhHK',
      },
      {
        type: 'counter5',
        fileName: 'counter5.wav',
        lang: 'zhHK',
      },
      {
        type: 'counter6',
        fileName: 'counter6.wav',
        lang: 'zhHK',
      },
      {
        type: 'counter7',
        fileName: 'counter7.wav',
        lang: 'zhHK',
      },
      {
        type: 'counter8',
        fileName: 'counter8.wav',
        lang: 'zhHK',
      },
      {
        type: 'next',
        fileName: 'next_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 'A',
        fileName: 'A_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 'B',
        fileName: 'B_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 'C',
        fileName: 'C_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 'D',
        fileName: 'D_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 0,
        fileName: '0_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 1,
        fileName: '1_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 2,
        fileName: '2_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 3,
        fileName: '3_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 4,
        fileName: '4_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 5,
        fileName: '5_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 6,
        fileName: '6_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 7,
        fileName: '7_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 8,
        fileName: '8_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 9,
        fileName: '9_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 'counter1',
        fileName: 'counter1_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 'counter2',
        fileName: 'counter2_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 'counter3',
        fileName: 'counter3_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 'counter4',
        fileName: 'counter4_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 'counter5',
        fileName: 'counter5_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 'counter6',
        fileName: 'counter6_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 'counter7',
        fileName: 'counter7_zhcn.wav',
        lang: 'zhCN',
      },
      {
        type: 'counter8',
        fileName: 'counter8_zhcn.wav',
        lang: 'zhCN',
      },
    ],
    emptyFnc: () => {
    },
    utilRaspberryPort: '5000',
  };
  
  export default constants;
  
  
  // WEBPACK FOOTER //
  // client/common/constants.js
  