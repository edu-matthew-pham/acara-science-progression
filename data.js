const DATA = {
  year_levels: {
    "F": { standards: [
      { code: "AC9SFU01", title: "Living things and needs", y_goal: "Students identify needs of living things and describe how they are met in different environments." },
      { code: "AC9SFU02", title: "Observable properties of objects", y_goal: "Students describe and sort objects and materials based on observable properties." },
      { code: "AC9SFU03", title: "Daily and seasonal change", y_goal: "Students describe how daily and seasonal changes affect living things and the environment." }
    ]},
    "1": { standards: [
      { code: "AC9S1U01", title: "Living things and reproduction", y_goal: "Students describe the basic needs of living things and how they reproduce and grow." },
      { code: "AC9S1U02", title: "Earth and sky observations", y_goal: "Students observe and describe features of Earth and the sky, including daily and seasonal changes." },
      { code: "AC9S1U03", title: "Forces and movement", y_goal: "Students describe how pushes and pulls affect the movement of objects." }
    ]},
    "2": { standards: [
      { code: "AC9S2U01", title: "Habitats and seasonal change", y_goal: "Students describe how seasonal changes affect living things and their habitats." },
      { code: "AC9S2U02", title: "Light and sound", y_goal: "Students describe sources of light and sound and how they travel and can be detected." },
      { code: "AC9S2U03", title: "Materials and change", y_goal: "Students describe the properties of materials and explore how they can be physically changed." }
    ]},
    "3": { standards: [
      { code: "AC9S3U01", title: "Living and non-living things", y_goal: "Students compare characteristics of living and non-living things and explain differences between plant and animal life cycles." },
      { code: "AC9S3U02", title: "Soils, rocks and minerals", y_goal: "Students compare observable properties of soils, rocks and minerals and explain their importance as Earth resources." },
      { code: "AC9S3U03", title: "Heat and temperature", y_goal: "Students describe sources of heat and the effects of heating and cooling on materials and living things." },
      { code: "AC9S3U04", title: "Properties of solids, liquids and gases", y_goal: "Students describe and compare the observable properties of solids, liquids and gases." }
    ]},
    "4": { standards: [
      { code: "AC9S4U01", title: "Food chains and habitats", y_goal: "Students explain the roles of consumers, producers and decomposers in a habitat and represent feeding relationships using food chains." },
      { code: "AC9S4U02", title: "Water cycle", y_goal: "Students describe the key processes of the water cycle including precipitation, evaporation and condensation." },
      { code: "AC9S4U03", title: "Forces and motion", y_goal: "Students explain how frictional, gravitational and magnetic forces are exerted between objects and describe their effects on motion." },
      { code: "AC9S4U04", title: "Properties of materials", y_goal: "Students explain how the properties of natural and made materials determine their suitability for different uses." }
    ]},
    "5": { standards: [
      { code: "AC9S5U01", title: "Structural features and survival", y_goal: "Students explain how specific structural features and behaviours of living things are adaptations that enable survival in particular habitats." },
      { code: "AC9S5U02", title: "Earth surface changes", y_goal: "Students describe how weathering, erosion, transportation and deposition change Earth's surface over slow and rapid timescales." },
      { code: "AC9S5U03", title: "Light and shadows", y_goal: "Students explain that light travels in straight paths from sources and describe how shadows, reflection and refraction result from this." },
      { code: "AC9S5U04", title: "Particle model of matter", y_goal: "Students use a particle model to explain the observable properties of solids, liquids and gases in terms of particle motion and arrangement." }
    ]},
    "6": { standards: [
      { code: "AC9S6U01", title: "Habitats and living things", y_goal: "Students analyse how physical conditions of a habitat affect the growth and survival of living things." },
      { code: "AC9S6U02", title: "Earth, planets and cycles", y_goal: "Students model and explain how Earth's tilt, rotation and revolution produce cyclic phenomena including variable day and night length." },
      { code: "AC9S6U03", title: "Electrical circuits and energy", y_goal: "Students explain how energy is transferred and transformed in electrical circuits and describe the role of components, insulators and conductors." },
      { code: "AC9S6U04", title: "Reversible and irreversible changes", y_goal: "Students compare reversible and irreversible changes, explaining what distinguishes them and identifying evidence that new substances have been produced." }
    ]},
    "7": { standards: [
      { code: "AC9S7U01", title: "Classification and biodiversity", y_goal: "Students explain why classification systems are used, apply and construct dichotomous keys, and evaluate how classification tools order and organise biodiversity." },
      { code: "AC9S7U02", title: "Food webs and ecosystems", y_goal: "Students use food web models to represent matter and energy flow, and predict and explain population impacts of changes to abiotic and biotic factors." },
      { code: "AC9S7U03", title: "Earth-Sun-Moon system", y_goal: "Students model and explain how cyclic changes in Earth-sun-moon positions cause eclipses, seasons and tides." },
      { code: "AC9S7U04", title: "Forces and motion", y_goal: "Students represent and explain how balanced and unbalanced forces, including gravity, relate to changes in an object's motion in terms of mass, magnitude and direction." },
      { code: "AC9S7U05", title: "Particle theory and properties", y_goal: "Students use particle theory to explain and predict the physical properties of substances in terms of particle arrangement, motion and attraction." },
      { code: "AC9S7U06", title: "Pure substances and mixtures", y_goal: "Students use a particle model to explain the difference between pure substances and mixtures, and select and apply appropriate separation techniques based on properties of substances." }
    ]},
    "8": { standards: [
      { code: "AC9S8U01", title: "Cells and multicellular organisms", y_goal: "Students explain the structure and function of cells and how they work together in multicellular organisms." },
      { code: "AC9S8U02", title: "Ecosystems and biodiversity", y_goal: "Students explain how biodiversity supports ecosystem functioning and evaluate the impact of changes on biodiversity." },
      { code: "AC9S8U03", title: "Rocks and geological time", y_goal: "Students explain how the rock cycle and geological processes shape Earth's surface over time." },
      { code: "AC9S8U04", title: "Energy transformations", y_goal: "Students describe and explain energy transformations in everyday contexts and evaluate efficiency." },
      { code: "AC9S8U05", title: "Wave energy", y_goal: "Students explain how wave properties determine energy transfer and apply this to sound and light." },
      { code: "AC9S8U06", title: "Atoms, elements and compounds", y_goal: "Students use atomic theory to explain the structure of atoms, elements and compounds and their properties." },
      { code: "AC9S8U07", title: "Chemical reactions", y_goal: "Students describe chemical reactions in terms of reactants, products, energy changes and conservation of mass." }
    ]},
    "9": { standards: [
      { code: "AC9S9U01", title: "Body systems and homeostasis", y_goal: "Students explain how body systems work together to maintain homeostasis." },
      { code: "AC9S9U02", title: "Ecosystems and evolution", y_goal: "Students explain the mechanisms of evolution and how they account for biodiversity." },
      { code: "AC9S9U03", title: "Global systems", y_goal: "Students explain how Earth's global systems interact and the impact of human activity on them." },
      { code: "AC9S9U04", title: "Electromagnetic spectrum", y_goal: "Students explain properties of electromagnetic radiation and their technological applications." },
      { code: "AC9S9U05", title: "Energy and motion", y_goal: "Students apply energy and motion concepts to explain and predict real-world phenomena." },
      { code: "AC9S9U06", title: "Periodic table and bonding", y_goal: "Students explain periodic trends and how bonding determines properties of substances." },
      { code: "AC9S9U07", title: "Rates of reaction", y_goal: "Students explain factors that affect reaction rates and apply this to industrial and biological contexts." }
    ]},
    "10": { standards: [
      { code: "AC9S10U01", title: "Genetics and heredity", y_goal: "Students explain the mechanisms of heredity and critically evaluate genetic technologies." },
      { code: "AC9S10U02", title: "Ecosystems and sustainability", y_goal: "Students evaluate the sustainability of ecosystems and the impact of biodiversity loss." },
      { code: "AC9S10U03", title: "Earth dynamics", y_goal: "Students explain plate tectonics and its relationship to geological events and Earth's structure." },
      { code: "AC9S10U04", title: "Electric circuits and fields", y_goal: "Students explain electric fields, circuits and their real-world applications." },
      { code: "AC9S10U05", title: "Forces and energy", y_goal: "Students apply Newton's laws and energy conservation to analyse and predict motion." },
      { code: "AC9S10U06", title: "Atomic structure and bonding", y_goal: "Students explain atomic models, nuclear reactions and their applications." },
      { code: "AC9S10U07", title: "Chemical reactions and energy", y_goal: "Students explain energy changes in chemical reactions and apply stoichiometric reasoning." }
    ]}
  },

  strands: {
    biological: {
      label: "Biological Sciences", key: "bio", color: "#1D9E75",
      tree: [
        { code: "AC9SFU01", children: [
          { code: "AC9S1U01", children: [
            { code: "AC9S3U01", children: [
              { code: "AC9S4U01", children: [
                { code: "AC9S5U01", children: [
                  { code: "AC9S6U01", children: [
                    { code: "AC9S7U01", children: [] },
                    { code: "AC9S7U02", children: [
                      { code: "AC9S8U01", children: [
                        { code: "AC9S9U01", children: [
                          { code: "AC9S10U01", children: [] }
                        ]}
                      ]},
                      { code: "AC9S8U02", children: [
                        { code: "AC9S9U02", children: [
                          { code: "AC9S10U02", children: [] }
                        ]}
                      ]}
                    ]}
                  ]}
                ]}
              ]}
            ]}
          ]}
        ]}
      ]
    },
    earth_space: {
      label: "Earth & Space Sciences", key: "earth", color: "#378ADD",
      tree: [
        { code: "AC9S1U02", children: [
          { code: "AC9S2U01", children: [
            { code: "AC9S6U02", children: [
              { code: "AC9S7U03", children: [
                { code: "AC9S10U03", children: [] }
              ]}
            ]}
          ]}
        ]},
        { code: "AC9S3U02", children: [
          { code: "AC9S5U02", children: [
            { code: "AC9S8U03", children: [
              { code: "AC9S9U03", children: [] }
            ]}
          ]}
        ]},
        { code: "AC9S4U02", children: [
          { code: "AC9S9U03", children: [] }
        ]}
      ]
    },
    physical: {
      label: "Physical Sciences", key: "phys", color: "#BA7517",
      tree: [
        { code: "AC9SFU02", children: [
          { code: "AC9S1U03", children: [
            { code: "AC9S4U03", children: [
              { code: "AC9S7U04", children: [
                { code: "AC9S9U05", children: [
                  { code: "AC9S10U05", children: [] }
                ]}
              ]}
            ]}
          ]}
        ]},
        { code: "AC9S2U02", children: [
          { code: "AC9S5U03", children: [
            { code: "AC9S9U04", children: [] }
          ]}
        ]},
        { code: "AC9S3U03", children: [
          { code: "AC9S6U03", children: [
            { code: "AC9S8U04", children: [
              { code: "AC9S10U04", children: [] }
            ]}
          ]}
        ]},
        { code: "AC9S8U05", children: [
          { code: "AC9S9U04", children: [] }
        ]}
      ]
    },
    chemical: {
      label: "Chemical Sciences", key: "chem", color: "#D85A30",
      tree: [
        { code: "AC9SFU03", children: [
          { code: "AC9S2U03", children: [
            { code: "AC9S3U04", children: [
              { code: "AC9S4U04", children: [
                { code: "AC9S5U04", children: [
                  { code: "AC9S7U05", children: [
                    { code: "AC9S7U06", children: [
                      { code: "AC9S8U06", children: [
                        { code: "AC9S9U06", children: [
                          { code: "AC9S10U06", children: [] }
                        ]},
                        { code: "AC9S8U07", children: [
                          { code: "AC9S9U07", children: [
                            { code: "AC9S10U07", children: [] }
                          ]}
                        ]}
                      ]}
                    ]}
                  ]}
                ]}
              ]}
            ]}
          ]}
        ]},
        { code: "AC9S6U04", children: [
          { code: "AC9S8U07", children: [] }
        ]}
      ]
    }
  }
};
