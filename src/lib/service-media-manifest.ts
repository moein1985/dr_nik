const toPaths = (base: string, nums: number[]) => nums.map((n) => `${base}/${n}.webp`);

export const serviceMediaManifest = {
  dental: {
    implants: [
      toPaths("/clinic/services/dental/implants/1", [301, 302, 303, 304]),
      toPaths("/clinic/services/dental/implants/2", [305, 306, 307]),
      toPaths("/clinic/services/dental/implants/3", [308, 309, 310, 311, 312, 313, 314, 315]),
      toPaths("/clinic/services/dental/implants/4", [316, 317, 318, 319, 320, 321]),
      toPaths("/clinic/services/dental/implants/5", [322, 323, 324, 325, 326]),
      toPaths("/clinic/services/dental/implants/6", [327, 328, 329, 330, 331]),
      toPaths("/clinic/services/dental/implants/7", [332, 333, 334, 335]),
      toPaths("/clinic/services/dental/implants/8", [336, 337, 338, 339, 340, 341, 342, 343]),
    ],
    bleaching: [
      toPaths("/clinic/services/dental/bleaching/1", [401, 402, 403, 404, 405, 406]),
      toPaths("/clinic/services/dental/bleaching/2", [407, 408, 409, 410, 411]),
      toPaths("/clinic/services/dental/bleaching/3", [412, 413, 414, 415, 416, 417]),
      toPaths("/clinic/services/dental/bleaching/4", [418, 419, 420, 421, 422, 423]),
      toPaths("/clinic/services/dental/bleaching/5", [424, 425, 426, 427, 428, 429]),
    ],
    scaling: [
      toPaths("/clinic/services/dental/scaling/1", [501, 502, 503, 504]),
    ],
    composite: [
      toPaths("/clinic/services/dental/composite/1", [601, 602, 603, 604, 605, 606, 607]),
      toPaths("/clinic/services/dental/composite/2", [608, 609, 610, 611, 612, 613]),
      toPaths("/clinic/services/dental/composite/3", [614, 615, 616, 617, 618, 619, 620, 621, 622]),
      toPaths("/clinic/services/dental/composite/4", [623, 624, 625, 626, 627, 628, 629, 630]),
      toPaths("/clinic/services/dental/composite/5", [631, 632, 633, 634, 635, 636, 637, 638, 639]),
    ],
    laminate: [
      toPaths("/clinic/services/dental/laminate/1", [701, 702, 703, 704, 705, 706, 707]),
      toPaths("/clinic/services/dental/laminate/2", [708, 709, 710, 711, 712]),
      toPaths("/clinic/services/dental/laminate/3", [713, 714, 715, 716, 717, 718, 719, 720, 721, 722]),
      toPaths("/clinic/services/dental/laminate/4", [723, 724, 725, 726, 727, 728, 729, 730, 731]),
      toPaths("/clinic/services/dental/laminate/5", [734, 735, 736, 737, 738, 739, 740, 741]),
      toPaths("/clinic/services/dental/laminate/6", [742, 743, 744, 745, 746, 747]),
      toPaths("/clinic/services/dental/laminate/7", [748, 749, 750, 751, 752, 753, 754, 755, 756]),
      toPaths("/clinic/services/dental/laminate/8", [757, 758, 759, 760, 761, 762, 763, 764, 765]),
    ],
  },
  facial: {
    fullface: toPaths("/clinic/services/facial/fullface", [801, 802, 803, 804, 805, 806]),
    botox: toPaths("/clinic/services/facial/botox", [807, 808, 809, 810, 811, 812, 813, 814, 815, 816, 817]),
    "smile-line": toPaths("/clinic/services/facial/smile-line", [818, 819, 820]),
    "face-angle": toPaths("/clinic/services/facial/face-angle", [821, 822, 823, 824, 825, 826, 827, 828, 829, 830, 831]),
    cheek: toPaths("/clinic/services/facial/cheek", [832, 833]),
    "cheek-chin": toPaths("/clinic/services/facial/cheek-chin", [834, 835, 836]),
    lip: toPaths("/clinic/services/facial/lip", [837, 838, 839, 840, 841]),
    nose: toPaths("/clinic/services/facial/nose", [842, 843]),
    "chin-before-after": toPaths("/clinic/services/facial/chin-before-after", [844, 845, 846, 847, 848, 849, 850, 851, 852, 853, 854, 855, 856]),
    "silhouette-thread": toPaths("/clinic/services/facial/silhouette-thread", [858, 859, 860, 861, 862, 863, 864]),
  },
  skinRejuvenation: {
    "cleaning-anti-spot": toPaths("/clinic/services/skin-rejuvenation/cleaning-anti-spot", [1001, 1002, 1003]),
    "prp-hair-filler": toPaths("/clinic/services/skin-rejuvenation/prp-hair-filler", [1004, 1005, 1006]),
  },
  bodyContouring: {
    placeholder: ["/clinic/services/body-contouring/placeholder.webp"],
  },
} as const;
