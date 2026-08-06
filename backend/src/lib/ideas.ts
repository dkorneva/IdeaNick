import _ from 'lodash'

// круглые скобки () заменяют конструкцию с return
export const ideas = _.times(100, (i) => ({
  nick: `cool-idea-nick-${i}`,
  name: `Idea ${i}`,
  description: `Description of idea ${i}...`,
  text: _.times(100, (j) => `<p>Text paragraph ${j} of idea ${i}...</p>`).join(''),
}))
