import { Rule } from 'json-rules-engine';
import { RULE_TYPE } from './processor.constants';

export const RULES: Rule[] = [
  buildHealthChangeRule(),
  poolConnectionChangeRule(),
  gigahashrateChangeRule(),
  buildFanSpeedRule(),
  buildFanTempRule(),
  buildAmbientTempRule(),
];

function buildHealthChangeRule(): Rule {
  return new Rule({
    conditions: {
      all: [
        {
          fact: 'previous',
          path: 'health',
          operator: 'equal',
          value: 'up',
        },
        {
          fact: 'incoming',
          path: 'health',
          operator: 'equal',
          value: 'down',
        },
      ],
    },
    event: {
      type: RULE_TYPE.MINER_HEALTH,
    },
  });
}

function poolConnectionChangeRule(): Rule {
  return new Rule({
    conditions: {
      all: [
        {
          fact: 'previous',
          path: 'pool_connection',
          operator: 'equal',
          value: 'up',
        },
        {
          fact: 'incoming',
          path: 'pool_connection',
          operator: 'equal',
          value: 'down',
        },
      ],
    },
    event: {
      type: RULE_TYPE.POOL_CONNECTION,
    },
  });
}

function gigahashrateChangeRule(): Rule {
  return new Rule({
    conditions: {
      all: [
        {
          fact: 'previous',
          path: 'gigahashrate',
          operator: 'greaterThan',
          value: 100,
        },
        {
          fact: 'incoming',
          path: 'gigahashrate',
          operator: 'lessThan',
          value: 100,
        },
      ],
    },
    event: {
      type: RULE_TYPE.GIGAHASH_RATE,
    },
  });
}

function buildFanSpeedRule(): Rule {
  const nestedConditions = [1, 2, 3, 4].map((num) => {
    return {
      all: [
        {
          fact: 'previous',
          path: `fan${num}`,
          operator: 'greaterThan',
          value: 10,
        },
        {
          fact: 'incoming',
          path: `fan${num}`,
          operator: 'lessThan',
          value: 10,
        },
      ],
    };
  });

  return new Rule({
    conditions: {
      any: nestedConditions,
    },
    event: {
      type: RULE_TYPE.MINER_FAN_SPEED,
    },
  });
}

function buildFanTempRule(): Rule {
  const nestedConditions = [1, 2, 3, 4].flatMap((num) => [
    {
      all: [
        {
          fact: 'previous',
          path: `temp${num}_in`,
          operator: 'lessThan',
          value: 85,
        },
        {
          fact: 'incoming',
          path: `temp${num}_in`,
          operator: 'greaterThan',
          value: 85,
        },
      ],
    },
    {
      all: [
        {
          fact: 'previous',
          path: `temp${num}_out`,
          operator: 'lessThan',
          value: 85,
        },
        {
          fact: 'incoming',
          path: `temp${num}_out`,
          operator: 'greaterThan',
          value: 85,
        },
      ],
    },
  ]);

  return new Rule({
    conditions: {
      any: nestedConditions,
    },
    event: {
      type: RULE_TYPE.MINER_FAN_TEMP,
    },
  });
}

function buildAmbientTempRule(): Rule {
  const nestedConditions = [1, 2, 3, 4].flatMap((num) => [
    {
      fact: 'incoming',
      path: `temp${num}_in`,
      operator: 'greaterThan',
      value: 85,
    },
  ]);

  return new Rule({
    conditions: {
      all: nestedConditions,
    },
    event: {
      type: RULE_TYPE.AMBIENT_TEMP,
    },
  });
}
