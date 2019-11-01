import A_wav from '../audios/A.wav';
import B_wav from '../audios/B.wav';
import C_wav from '../audios/C.wav';
import D_wav from '../audios/D.wav';
import ding_wav from '../audios/ding.wav';
import next_wav from '../audios/next.wav';
import next_zhcn_wav from '../audios/next_zhcn.wav';
import z0_wav from '../audios/0.wav';
import z1_wav from '../audios/1.wav';
import z2_wav from '../audios/2.wav';
import z3_wav from '../audios/3.wav';
import z4_wav from '../audios/4.wav';
import z5_wav from '../audios/5.wav';
import z6_wav from '../audios/6.wav';
import z7_wav from '../audios/7.wav';
import z8_wav from '../audios/8.wav';
import z9_wav from '../audios/9.wav';
import counter1_wav from '../audios/counter1.wav';
import counter2_wav from '../audios/counter2.wav';
import counter3_wav from '../audios/counter3.wav';
import counter4_wav from '../audios/counter4.wav';
import counter5_wav from '../audios/counter5.wav';
import counter6_wav from '../audios/counter6.wav';
import counter7_wav from '../audios/counter7.wav';
import counter8_wav from '../audios/counter8.wav';
import A_zhcn_wav from '../audios/A_zhcn.wav';
import B_zhcn_wav from '../audios/B_zhcn.wav';
import C_zhcn_wav from '../audios/C_zhcn.wav';
import D_zhcn_wav from '../audios/D_zhcn.wav';
import z1_zhcn_wav from '../audios/1_zhcn.wav';
import z2_zhcn_wav from '../audios/2_zhcn.wav';
import z3_zhcn_wav from '../audios/3_zhcn.wav';
import z4_zhcn_wav from '../audios/4_zhcn.wav';
import z5_zhcn_wav from '../audios/5_zhcn.wav';
import z6_zhcn_wav from '../audios/6_zhcn.wav';
import z7_zhcn_wav from '../audios/7_zhcn.wav';
import z8_zhcn_wav from '../audios/8_zhcn.wav';
import z9_zhcn_wav from '../audios/9_zhcn.wav';
import z0_zhcn_wav from '../audios/0_zhcn.wav';
import counter1_zhcn_wav from '../audios/counter1_zhcn.wav';
import counter2_zhcn_wav from '../audios/counter2_zhcn.wav';
import counter3_zhcn_wav from '../audios/counter3_zhcn.wav';
import counter4_zhcn_wav from '../audios/counter4_zhcn.wav';
import counter5_zhcn_wav from '../audios/counter5_zhcn.wav';
import counter6_zhcn_wav from '../audios/counter6_zhcn.wav';
import counter7_zhcn_wav from '../audios/counter7_zhcn.wav';
import counter8_zhcn_wav from '../audios/counter8_zhcn.wav';
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
      fileName: ding_wav
    },
    {
      type: 'next',
      fileName: next_wav,
      lang: 'zhHK',
    },
    {
      type: 'A',
      fileName: A_wav,
      lang: 'zhHK',
    },
    {
      type: 'B',
      fileName: B_wav,
      lang: 'zhHK',
    },
    {
      type: 'C',
      fileName: C_wav,
      lang: 'zhHK',
    },
    {
      type: 'D',
      fileName: D_wav,
      lang: 'zhHK',
    },
    {
      type: 0,
      fileName: z0_wav,
      lang: 'zhHK',
    },
    {
      type: 1,
      fileName: z1_wav,
      lang: 'zhHK',
    },
    {
      type: 2,
      fileName: z2_wav,
      lang: 'zhHK',
    },
    {
      type: 3,
      fileName: z3_wav,
      lang: 'zhHK',
    },
    {
      type: 4,
      fileName: z4_wav,
      lang: 'zhHK',
    },
    {
      type: 5,
      fileName: z5_wav,
      lang: 'zhHK',
    },
    {
      type: 6,
      fileName: z6_wav,
      lang: 'zhHK',
    },
    {
      type: 7,
      fileName: z7_wav,
      lang: 'zhHK',
    },
    {
      type: 8,
      fileName: z8_wav,
      lang: 'zhHK',
    },
    {
      type: 9,
      fileName: z9_wav,
      lang: 'zhHK',
    },
    {
      type: 'counter1',
      fileName: counter1_wav,
      lang: 'zhHK',
    },
    {
      type: 'counter2',
      fileName: counter2_wav,
      lang: 'zhHK',
    },
    {
      type: 'counter3',
      fileName: counter3_wav,
      lang: 'zhHK',
    },
    {
      type: 'counter4',
      fileName: counter4_wav,
      lang: 'zhHK',
    },
    {
      type: 'counter5',
      fileName: counter5_wav,
      lang: 'zhHK',
    },
    {
      type: 'counter6',
      fileName: counter6_wav,
      lang: 'zhHK',
    },
    {
      type: 'counter7',
      fileName: counter7_wav,
      lang: 'zhHK',
    },
    {
      type: 'counter8',
      fileName: counter8_wav,
      lang: 'zhHK',
    },
    {
      type: 'next',
      fileName: next_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 'A',
      fileName: A_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 'B',
      fileName: B_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 'C',
      fileName: C_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 'D',
      fileName: D_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 0,
      fileName: z0_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 1,
      fileName: z1_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 2,
      fileName: z2_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 3,
      fileName: z3_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 4,
      fileName: z4_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 5,
      fileName: z5_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 6,
      fileName: z6_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 7,
      fileName: z7_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 8,
      fileName: z8_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 9,
      fileName: z9_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 'counter1',
      fileName: counter1_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 'counter2',
      fileName: counter2_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 'counter3',
      fileName: counter3_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 'counter4',
      fileName: counter4_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 'counter5',
      fileName: counter5_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 'counter6',
      fileName: counter6_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 'counter7',
      fileName: counter7_zhcn_wav,
      lang: 'zhCN',
    },
    {
      type: 'counter8',
      fileName: counter8_zhcn_wav,
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
