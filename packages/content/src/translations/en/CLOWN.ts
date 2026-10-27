// English preview manuscript for every CLOWN signal. Stable IDs and scoring live in Korean source.
export const clownEnglish = {
  title: 'The Clown Who Laughed Last',
  summary: 'Lubo, a cartmaker’s son, became a market clown. Even when someone else held the stage, he chased applause for himself. After leaving the stage, he repaired performance props.',
  profilePages: [
    { title: 'Page 1 · Who was he?', body: 'Lubo · Man\nErdan, Market Year 142–203 · 61 years old\nSouthern Windvale Market\nWork · Clown, then repairer of performance props\nLife · He performed with Pino, but once stepped into the children’s show and took the applause. One young performer left, and Pino moved to another market. When a painful ankle kept Lubo offstage, he repaired props instead.' },
    { title: 'Page 2 · What was he like?', body: 'Personality · He spoke first to people who hesitated. When the audience looked at another performer, he wanted to draw their eyes back to himself.\nHe liked · The sound of cart wheels and the odd jokes children invented\nHe disliked · People who kept mocking an actor after a mistake, even once the show was over\nHe was good at · Reading faces in the crowd and finding a new scene for an old prop' },
    { title: 'Page 3 · What mattered?', body: 'People close to him · His father, who repaired carts, and Pino, who shared the stage with him. For a time he prepared a show with the young actor Nami, but they grew apart.\nWhat he treasured · His well-worn oversized shoes and a short wooden ruler from his father’s workshop\nWhat he hoped for · A market where children without money could still watch a show, and an audience waiting for his jokes\nWhat worried him · That when age slowed his feet, there would be no place for him onstage' },
  ],
  episode: [
    'In a past life, you were Lubo, a clown at Windvale Market. You noticed a quiet crowd before anyone else did. This is the story of the first day Lubo sat among the audience instead of standing onstage.',
    'The spring market show did not begin as planned. The rain had only just stopped, leaving mud in front of the stage. Whenever a loaded cart rolled past, the spectators’ voices drowned out the actors. Lubo pulled down his enormous hat and got ready to go out. When a show fell quiet, he was always the first to tumble and bring back the laughter.',
    'But his fellow performer Pino caught his arm. “I’ll do the opening scene today.”',
    'While Lubo turned to look at him, Pino set a chair beside the stage. It faced the audience, not the performers. Pino sat Lubo down and drew the curtain shut.',
    'Something scraped across the floor behind the curtain. One of the oversized shoes from Lubo’s performance bag was missing too. Has he stolen my scene? Lubo thought. Just as he started to rise, the curtain opened.',
    'Pino came out dragging a shoe three times the size of his foot. He put it on and tried to bow, but his foot slipped free while the shoe skated toward the audience on its own. Pino scolded it. “Do you think you’re the star of this show?”',
    'Nobody laughed. The brief silence felt endless to Lubo. Usually he would have dashed onto the stage at once. Without looking at him, Pino stood the shoe upright and tried another bow.',
    'From his chair Lubo called, “That shoe won’t even return your greeting!” Pino bowed to it more politely, and laughter broke out in the front row.',
    'As the laughter spread, Pino rolled across the stage with even greater enthusiasm. Lubo realized that Pino had not taken the shoe just to steal his moment. He had wanted to show Lubo what kind of scene he could make when Lubo did not rush in.',
    'Then the shoe fell off the stage. Lubo reached out by reflex, but the child who had been sitting beside him picked it up first. The child tossed it to Pino, who caught it and wore it as a hat. This time Lubo laughed aloud too.',
    'After the show, Pino asked, “Are you angry?”',
    '“Where are my shoes?”',
    'Pino pointed behind him. Lubo’s own shoes were neatly tucked beneath the chair. What he had lost was not a shoe, but the turn he had always believed was his: the first joke of every show.',
    'Lubo never performed the scene he had prepared that day. It was also the first time he watched someone else’s laughter from beginning to end. Afterward, he kept one seat empty at every performance. Sometimes a fellow actor sat there. On another day, Lubo sat there again.',
  ].join('\n\n'),
  timeline: [
    '142 · Born to a cartmaker’s family near Windvale Market',
    'Age 8 · Saw the traveling troupe’s trick puppet while visiting the market with his father to repair a cart',
    'Age 13 · Put on short puppet plays with scraps of wood for children waiting at his father’s workshop',
    'Age 17 · Helped in the workshop and began training as a clown at Windvale Market',
    'Age 26 · Formed a two-person act with Pino',
    'Age 34 · Watched Pino’s first solo performance from a seat in the spring market audience',
    'Age 38 · When fewer carts were ordered and his father closed the workshop, he reused the remaining wood and tools to repair stage props',
    'Age 42 · Opened a place at the market where children could perform short scenes of their own',
    'Age 44 · Interrupted young actor Nami’s final scene on a quiet day and took the applause. Nami stopped performing with him and appeared at another market',
    'Age 49 · Pino left to stage his own shows at another market. Lubo did not answer Pino’s invitation to join him and kept performing alone in Windvale',
    'Age 55 · Frequent ankle pain took him off the stage. He used the woodworking skills his father taught him to repair market props. He repaired one prop for Nami, but they did not perform together again',
    'Age 61 · Died in Windvale',
  ].join('\n\n'),
  memories: [
    'The place he tried to protect\nThe space in front of the market stage where a child without money could still stand and watch',
    'What he treasured most\nHis oversized shoes, worn open at the toes, and his father’s short wooden ruler. He kept both close when repairing props',
    'A habit he kept for years\nLooking at the audience’s faces before looking at the actors before each show',
    'Words he left behind\n“Don’t throw that shoe away. Stitch the toe and it can make them laugh once more.”',
    'Pino’s view of him\n“He watched my first solo show all the way through. But after I went to another market, he never answered my letter.”',
    'Actor Nami’s view of him\n“He stepped into my last joke and took the applause. Fixing one of my props later did not change that day.”',
    'A workshop neighbor’s view\n“Even after the workshop closed, he never put down that wooden ruler. When he could no longer perform, those same hands repaired other people’s props.”',
  ].join('\n\n'),
} as const;

const clownEpisodeParagraphs = clownEnglish.episode.split('\n\n');

export const clownEnglishEpisode = {
  beforeSignal: clownEpisodeParagraphs.slice(0, 7).join('\n\n'),
  signalMoments: {
    speak: clownEpisodeParagraphs[7]!,
    connect: 'Lubo turned to the child beside him. “Where do you think that shoe is going?” The child pointed at a passing cart. Pino caught the idea and let the shoe pull him across the stage like a cart. At last the audience began to laugh.',
    release: 'Lubo kept the foot that wanted to run onto the stage tucked beneath his chair. Pino tried three times to stand the shoe upright. Each time it toppled over. Laughter finally burst from the front row.',
  },
  afterSignal: clownEpisodeParagraphs.slice(8).join('\n\n'),
} as const;

export function renderClownEnglishEpisode(signal: keyof typeof clownEnglishEpisode.signalMoments): string {
  return [clownEnglishEpisode.beforeSignal, clownEnglishEpisode.signalMoments[signal], clownEnglishEpisode.afterSignal].join('\n\n');
}

export const clownEnglishFinalMoment = {
  year: 'Market Year 203',
  place: 'Windvale Market, southern Erdan',
  protagonist: 'Lubo',
  scene: [
    'The market’s last show is over, and I sit on a low chair backstage. I no longer perform, but today I repaired the actors’ shoes. A young actor sits before me and examines the loose toe of my oversized shoe. A sharp pain runs up my ankle when I move it.',
    '“Shall I stitch it?” the actor asks. Once, I would have grabbed the needle and made a joke first. “If you pull the toe too tight, your foot will catch.” I point to the gap with my father’s short wooden ruler. Following my words, the young actor passes the thread through slowly.',
    'I still have not written back to Pino. He invited me to see his new show in another market, but I do not know whether I can travel that far now. I remember the days when children without money stood before the stage, and the day I laughed from the audience because it was not my turn. Just when I think I have seen every joke, there may still be one I have never seen. Will I laugh when that actor stumbles in those shoes tomorrow?',
    'A brief laugh breaks out beyond the curtain. The young actor ties the thread and lets go of my foot. “Is it all right now?” I inspect the toe and nod. Then something tightens sharply in the middle of my chest. I try to breathe in, but there is not enough air. “Please get someone,” I say. The actor runs beyond the curtain. I press the hand holding the ruler to my chest. I hear laughter from the audience again, but I cannot turn my head.',
  ].join('\n\n'),
  afterword: 'In Market Year 203, Lubo died at Windvale Market when a vessel in his heart suddenly became blocked. By the time the young actor returned with help, Lubo had stopped breathing. For a while, the actor left Lubo’s chair backstage, then turned it toward the audience for the next show. The letter he meant to send Pino remained on his desk, but the newly stitched shoe returned to the stage. The archive keeps here the next joke he never saw.',
  artAlt: 'Lubo sits backstage holding a short wooden ruler while a young actor stitches his oversized shoe at Windvale Market in Market Year 203.',
} as const;
