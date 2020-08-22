import Discord from 'discord.js'

const rules = new Discord.MessageEmbed()

rules
  .setColor('#0099FF')
  .setTitle('Keeper League Rules - Thee 608')
  .addFields(
    {
      name: '1. Keepers',
      value: 'A team may keep up to two players from their team from the previous year. A team may not keep more than one player per position. The keepers must be set or told to the commissioner by draft time or a team will not be able to have keepers for that year. At that time all of a team’s players from the previous year will be available to draft. We will observe ESPN’s list of undroppable players. These are subject to change and can be viewed here: http://games.espn.com/ffl/tools/undroppables'
    },
    {
      name: '1a. Keeper Value',
      value: 'Players kept from draft day through roster lock day will cost your team a draft pick immediately higher from where he was drafted the year before. If you keep a 3rd round player, you will lose a 2nd round pick in the next season\'s draft. As a result, NO FIRST ROUND PICKS MAY BE KEPT unless they fall under the Injured Reserve Rule.',
    },
    {
      name: '\u2800',
      value: 'Players drafted, released, and re-acquired by the same team will not lose their original draft value.'
    },
    {
      name: '\u2800',
      value: 'Players drafted, traded and kept will not lose their original draft value. Undrafted players acquired in free agency or through waivers will not be eligible to be kept the following season.',
    },
    {
      name: '\u2800',
      value: 'Skill players drafted in the 7th round or later will incur a MINIMUM KEEPER VALUE that will result in a 6th round pick the following year. No skill players will be able to be kept and be valued at a 7th round pick or later. If a team decides they would like to keep two players drafted in the 7th round or later they may do so. These players, as chosen by the team, will be valued at a 5th and 6th round pick.'
    },
    {
      name: '\u2800',
      value: 'Quarterbacks drafted in the 11th round or later will incur a MINIMUM KEEPER VALUE of a 10th round pick.'
    },
    {
      name: '1b. Keeper Contract Length',
      value: 'Players may not be kept longer than three years total, regardless of where they would fall in next year’s draft position according to rule (1a). This would include players acquired in trades. Players who fall under the injured reserve rule would have their maximum contract length extended by the number of seasons they are on injured reserve.',
    },
    {
      name: '2. Injured Reserve Rule',
      value: 'Players must be put on injured reserve by the end of week 6 (that Tuesday). These players must miss the rest of the fantasy season. IMPORTANT: ESPN allows players designated as Suspended or Out to be placed in our IR slots. THIS IS NOT HOW WE WILL USE IT. This only pertains to players on IR in real life. If this becomes an issue we will just move the IR spot off of ESPN and keep track of it on another document.',
    },
    {
      name: '\u2800',
      value: 'Example - Urf drafted David Johnson with his first round pick in 2018, and Tyson drafted Odell Beckham Jr. with his first pick. These players would be eligible for IR. Ezekiel Elliott missed the first four games of last season. He would not be eligible for your IR slot in our league, even though ESPN will allow you to use it. The commissioner will be monitoring this each week.'
    },
    {
      name: '\u2800',
      value: 'A player that was placed on IR would be eligible to retain his draft value from that following year. This would include first round draft picks. If you would like to keep another player, but their plus one draft value according to rule (1a) would make them the same value as your player coming off of IR, then they are also eligible to simply retain their same draft value.',
    },
    {
      name: '3. Trades',
      value: 'There will be no vetoing of draft picks except by the commissioner in instances of obvious collusion.',
    },
    {
      name: '4. Draft Order',
      value: 'The draft order for following years would start with a lottery. All non playoff teams would qualify for the lottery. Each team will be given a percentage change to get the first pick according to the previous year’s finish. The percentages are as follows:',
    },
    {
      name: '\u2800',
      value: '12th - 50%\n11th - 25%\n10th - 12%\n 9th - 8%\n 8th - 4%\n 7th - 1%',
    },
    {
      name: '\u2800',
      value: 'The lottery will pick the top three picks for the following year’s draft, and the rest will be according to the previous year’s records and tie breakers (tie breakers being 1. Points Scored and 2. Head to Head). This means that the absolute lowest the last place team could draft the following year is 4th overall.'
    },
    {
      name: '\u2800',
      value: 'The first two rounds of each following year’s draft will be non snake. This means the team with the first overall pick would also have the 13th overall pick, but their next pick would then be the 36th and 37th overall. With the champion drafting 12th, 24th, 25th overall (and so on)',
    },
    {
      name: '4. NFL Cancellation',
      value: 'If, for any reason, the NFL season is ended before a champion is crowned, then the owners will not owe money for that season. Nor will the owners be able to earn any money from the payouts.',
    },
    {
      name: '\u2800',
      value: 'The draft lottery will happen in the same order, and any draft picks traded in season will be undone. Owners will have a keeper pool reset to what it was before the draft of the season that was cancelled. This includes any players traded in season. The keeper’s contract lengths will be extended one year.',
    }
  )

export default rules