// Fourth Wish Adoption Desk: a practice CRM with a guided walkthrough.
// The whole screen re-renders from `state` after every action; clicks are
// handled by one delegated listener that reads data-action / data-arg.
// Everything here is made up: the animals, the people, and the report numbers.
(function () {
  'use strict';

  var app = document.getElementById('app');
  var APOLLO = '0417';
  var ORDER = ['0417', '0412', '0409', '0405', '0401', '0398'];

  function fresh() {
    return {
      screen: 'queue',
      caseId: null,
      tab: 'app',
      query: '',
      work: {},
      notice: '',
      animalFilter: 'all'
    };
  }

  var state = Object.assign(fresh(), { tour: true, step: 0, range: 'week', table: false });

  function set(patch) {
    Object.assign(state, patch);
    render();
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---------- Data ----------

var CASES = {
      '0417': {
        animal: 'Apollo', kind: 'Lab mix, 3 yrs', applicant: 'Maya Alvarez', submitted: 'Sep 22', status: 'Needs review',
        sub: 'Lab mix · 3 years · Male · 62 lb',
        animalFacts: [['Species', 'Dog'], ['Breed', 'Lab mix'], ['Age', '3 years'], ['Weight', '62 lb'], ['Neutered', 'Yes'], ['In care since', 'Jun 2025']],
        applicantFacts: [['Name', 'Maya Alvarez'], ['City', 'Mesa, AZ'], ['Submitted', 'Sep 22'], ['Reviewer', 'You (trainee)']],
        app: [
          ['Residence', 'Owns a single-family home with a fenced yard.'],
          ['Dog experience', '12 years. Two dogs at home today.'],
          ['Why Apollo', "“Rosie needs a playmate who can keep up. Duke has opinions, but he'll adjust.”"],
          ['Vet reference', 'Desert Paws Veterinary, on file.'],
          ['Household', '2 dogs (Rosie, 6 · Duke, 9), 1 cat (Moose), 1 bearded dragon (Steve).', 'house']
        ],
        vet: [
          ['Jun 3, 2025', 'Intake exam. Healthy, 62 lb.'],
          ['Jun 3, 2025', 'Vaccines. DHPP, rabies, and Bordetella given.'],
          ['Jun 20, 2025', 'Neuter. Completed, no complications.'],
          ['Jun 20, 2025', 'Heartworm test. Negative.'],
          ['Jan 22, 2026', 'Recheck. Mild limp, left rear leg. X-ray ordered.'],
          ['No entries since', "Eight months without a record. The X-ray result isn't on file.", 'vet']
        ],
        home: [
          ['Visit', 'Completed Oct 2 by R. Okafor, volunteer.'],
          ['Recommendation', 'Approve.'],
          ['Yard', '6 ft privacy fence. Gate latches.'],
          ['Animal spaces', "Steve's enclosure is in a spare room. The door closes."],
          ['Dogs', 'Rosie and Duke stayed calm at the meet, then sniffed and settled within minutes.'],
          ['Cat', "Moose left the room and didn't come back during the visit.", 'cat']
        ],
        notes: [
          ['Sep 22', 'Application received.'],
          ['Sep 25', 'Phone interview. Applicant was confident and specific about training plans, and said Rosie “needs a job.”'],
          ['Oct 2', 'Home visit completed.'],
          ['Oct 6', 'Case assigned to you for review.']
        ],
        flags: {
          vet: { must: true, note: 'Flagged. The next reviewer will see this gap first, and it shows on the case summary.' },
          house: { note: 'Noted. A full household deserves a look, but the home visit shows how the animals are kept apart. Usually not a blocker.' },
          cat: { note: 'Noted. Cats often retreat from visitors. Worth a mention, rarely a blocker.' }
        },
        best: 'info',
        out: {
          info: { tone: 'good', title: 'Good call', m: 'Requesting more information is the right move. The home visit is strong, so the only open question is the X-ray ordered in January with no result on file.', mf: ' You flagged it, so the next reviewer knows exactly what to ask for.', warnTitle: 'Right call, one step missing', warnMsg: "Requesting more information fits this case. One thing is missing: you haven't flagged the vet gap, so your request has no paper trail. Open Vet history, flag it, and your decision will read as complete." },
          approve: { tone: 'warn', title: 'Not yet', m: "The application and home visit are strong, but approving now skips a loose end. The last vet record is an X-ray order with no result, eight months old. If Apollo's leg needs care, his adopter should know before he goes home.", mf: ' You spotted the gap, which is the hard part. A flag is a reason to pause, not just to note.', mn: " You also haven't flagged the gap yet." },
          deny: { tone: 'bad', title: 'More than this case calls for', m: 'A records gap is a reason to ask questions, not to say no. The applicant has 12 years of dog experience and a recommended home visit, so this looks like a good match with a paperwork hole.' }
        }
      },

      '0412': {
        animal: 'Juniper', kind: 'Tabby cat, 1 yr', applicant: 'Nia Brandt', submitted: 'Sep 20', status: 'Needs review',
        sub: 'Tabby cat · 1 year · Female · 8 lb',
        animalFacts: [['Species', 'Cat'], ['Breed', 'Domestic tabby'], ['Age', '1 year'], ['Weight', '8.4 lb'], ['Spayed', 'Yes'], ['In care since', 'May 2026']],
        applicantFacts: [['Name', 'Nia Brandt'], ['City', 'Tempe, AZ'], ['Submitted', 'Sep 20'], ['Reviewer', 'You (trainee)']],
        app: [
          ['Residence', 'Rents a two-bedroom apartment. Signed landlord letter allows cats.', 'rent'],
          ['Cat experience', 'Nine years with one cat, Mango, who passed last spring.'],
          ['Why Juniper', '“Mango was a lap cat. Juniper is a window-watcher with opinions. I am ready for that.”'],
          ['Vet reference', 'Southwest Feline Clinic, on file.'],
          ['Household', 'Lives with a partner. No other pets.'],
          ['Schedule', 'In the office Tuesday to Thursday and home the rest of the week.', 'alone']
        ],
        vet: [
          ['May 12', 'Intake exam. Healthy, 7.9 lb.'],
          ['May 12', 'Vaccines. FVRCP and rabies given. FeLV/FIV negative.'],
          ['May 28', 'Spay. Completed, no complications.'],
          ['Jun 2', 'Microchip implanted and registered.'],
          ['Sep 15', 'Recheck. Healthy, 8.4 lb. Cleared for adoption.']
        ],
        home: [
          ['Visit', 'Completed Sep 29 by T. Nguyen, volunteer.'],
          ['Recommendation', 'Approve.'],
          ['Space', 'Second-floor apartment with a quiet bedroom set up as a safe room.'],
          ['Balcony', 'Fully netted before the visit. The door stays latched when no one is home.', 'balcony'],
          ['Supplies', 'Litter box, scratching post, and two window perches ready.'],
          ['Partner', 'Jordan was present and fully on board.']
        ],
        notes: [
          ['Sep 20', 'Application received.'],
          ['Sep 23', 'Phone interview. Nia asked thoughtful questions about Juniper’s energy and said they would rather wait for the right cat than rush.'],
          ['Sep 29', 'Home visit completed.'],
          ['Oct 6', 'Case assigned to you for review.']
        ],
        flags: {
          rent: { note: "Flagged, but this one is already settled. The signed landlord letter is on file, so renting isn't a risk here." },
          balcony: { note: 'Noted, but the home visit confirms the balcony is netted and latched. Nothing is left open.' },
          alone: { note: 'Noted. A cat with a window and a few hours alone is a perfectly ordinary week.' }
        },
        best: 'approve',
        out: {
          approve: { tone: 'good', title: 'Good call', m: 'Every document is in, the vet record has no gaps, and the home visit is a clear approve. Cases like this are the majority, and part of the job is recognizing when nothing is wrong.' },
          info: { tone: 'warn', title: 'Careful, but not needed', m: 'Asking for more information when nothing is missing delays a good match and makes the applicant repeat themselves. Check Vet history and Home visit again. Both are complete.' },
          deny: { tone: 'bad', title: 'No grounds here', m: 'Nothing in this file is a reason to say no. The landlord letter is on file, the balcony is netted, and the home visit recommends approval.' }
        }
      },

      '0409': {
        animal: 'Biscuit', kind: 'Corgi mix, 5 yrs', applicant: 'Ellen Whitaker', submitted: 'Sep 18', status: 'In progress',
        sub: 'Corgi mix · 5 years · Male · 28 lb',
        animalFacts: [['Species', 'Dog'], ['Breed', 'Corgi mix'], ['Age', '5 years'], ['Weight', '28 lb'], ['Neutered', 'Yes'], ['In care since', 'Mar 2026']],
        applicantFacts: [['Name', 'Ellen Whitaker'], ['City', 'Gilbert, AZ'], ['Submitted', 'Sep 18'], ['Reviewer', 'You (trainee)']],
        app: [
          ['Residence', 'Owns a ranch home with a fenced back yard.'],
          ['Dog experience', 'Lifelong. Her last corgi, Pudding, lived to 15.'],
          ['Why Biscuit', '“I miss having a short, loud roommate.”'],
          ['Vet reference', 'Gilbert Family Pet Clinic, on file.'],
          ['Routine', 'Retired. Walks twice a day and keeps vet visits on a calendar.', 'retired'],
          ['Household', 'Lives with her husband. Grandson Theo (4) stays Thursday to Sunday every week.', 'grand']
        ],
        vet: [
          ['Mar 9', 'Intake exam. Healthy, 28 lb.'],
          ['Mar 9', 'Vaccines. DHPP, rabies, and Bordetella given.'],
          ['Mar 24', 'Neuter. Completed, no complications.'],
          ['Apr 14', 'Dental cleaning. Two extractions, healed well.'],
          ['Aug 12', 'Behavior evaluation. Snapped at a child who reached for his food bowl. No skin broken. Placement note: adults only, or children 10 and older.', 'behav'],
          ['Sep 2', 'Recheck. Healthy, 27.6 lb. Cleared medically.']
        ],
        home: [
          ['Visit', 'Completed Sep 26 by R. Okafor, volunteer.'],
          ['Recommendation', 'Approve. “Lovely, welcoming home.”'],
          ['Yard', 'Fenced back yard, 5 ft fence. Gate latches.'],
          ['Dog space', 'Bed and crate set up in the living room.'],
          ['Around the house', 'Toy bins in the living room and a booster seat at the kitchen table.'],
          ['Hosts', 'Ellen and her husband were both present and friendly.']
        ],
        notes: [
          ['Sep 18', 'Application received.'],
          ['Sep 21', 'Phone interview. Ellen was warm, organized, and asked good questions about Biscuit’s routine.'],
          ['Sep 26', 'Home visit completed. The Aug 12 behavior note was not attached to the visit packet.'],
          ['Oct 6', 'Case assigned to you for review.']
        ],
        flags: {
          behav: { must: true, note: 'Flagged. This is the note that limits where Biscuit can go, and it was missing from the home visit packet.' },
          grand: { must: true, note: 'Flagged. A four-year-old in the home four days a week sits right on the placement note.' },
          retired: { note: "Noted, but being retired isn't a risk. If anything, it means Biscuit wouldn't be alone much." }
        },
        best: 'deny',
        out: {
          deny: { tone: 'good', title: 'Sound decision', m: "Biscuit's file limits placement to adult homes or children 10 and older, and a four-year-old stays with Ellen four days a week. Everything else about the application is lovely, which is what makes this one hard. A denial protects Theo and Biscuit both. Ellen would likely suit a different dog on the adopt list.", warnTitle: 'Right call, key evidence not flagged', warnMsg: "Denying fits this case, but your decision has no paper trail. Flag the Aug 12 behavior note on Vet history and the grandson in the Application household so the decision can be defended later." },
          info: { tone: 'warn', title: 'Kind, but it will not change anything', m: 'More information cannot change who lives in or visits the home. The placement restriction is firm, and both facts are already in the file.', mn: ' Flag the Aug 12 behavior note and the grandson, then look again.' },
          approve: { tone: 'bad', title: 'Not safe to approve', m: "Biscuit's Aug 12 behavior note limits him to adult homes or children 10 and older. Ellen's grandson is four and visits every week. The home visit missed it because the note was not in the visitor's packet.", mn: " You also haven't flagged the note or the grandson." }
        }
      },

      '0405': {
        animal: 'Marmalade', kind: 'Orange cat, 2 yrs', applicant: 'Sam Torres', submitted: 'Sep 17', status: 'In progress',
        sub: 'Domestic shorthair · 2 years · Male · 11 lb',
        animalFacts: [['Species', 'Cat'], ['Breed', 'Domestic shorthair'], ['Age', '2 years'], ['Weight', '11 lb'], ['Neutered', 'Yes'], ['In care since', 'Jun 2026']],
        applicantFacts: [['Name', 'Sam Torres'], ['City', 'Chandler, AZ'], ['Submitted', 'Sep 17'], ['Reviewer', 'You (trainee)']],
        app: [
          ['Residence', 'Rents a one-bedroom apartment. Landlord letter on file.'],
          ['Cat experience', 'First cat as an adult. Grew up with family cats.'],
          ['Other pets', 'None.'],
          ['Why Marmalade', '“He looks like he would judge my cooking, and I need that.”'],
          ['Vet reference', 'Tempe Animal Hospital, on file.'],
          ['Schedule', 'Works overnight shifts and is home by 7 a.m.', 'nights']
        ],
        vet: [
          ['Jun 11', 'Intake exam. Healthy, 11 lb.'],
          ['Jun 11', 'Vaccines. FVRCP and rabies given. FeLV/FIV negative.'],
          ['Jun 24', 'Neuter. Completed, no complications.'],
          ['Aug 20', 'Recheck. Mild tartar on back teeth. Recheck in six months.', 'dental']
        ],
        home: [
          ['Visit', 'Completed Sep 28 by T. Nguyen, volunteer.'],
          ['Recommendation', 'Approve.'],
          ['Cat space', 'Corner of the bedroom with a tree, a litter box, and a covered bed.'],
          ['Safety', 'Window screens secure. Cords tucked away.'],
          ['By the door', 'A dog bed, a leash, and a water bowl labeled “Bruno.” The volunteer did not ask about them.', 'bruno'],
          ['Building', 'Quiet complex with no size limits for cats.']
        ],
        notes: [
          ['Sep 17', 'Application received.'],
          ['Sep 20', 'Phone interview. Sam was friendly and prompt. Mentioned “walking Bruno before the call” and did not bring Bruno up again.'],
          ['Sep 28', 'Home visit completed.'],
          ['Oct 6', 'Case assigned to you for review.']
        ],
        flags: {
          bruno: { must: true, note: 'Flagged. The application says no other pets, but there are a dog\'s things by the door and a mention of Bruno on the phone. That is a question to ask.' },
          nights: { note: "Noted. Overnight shifts mean Sam is home during the day, when most cats are awake. Not a concern." },
          dental: { note: 'Noted. Mild tartar with a six-month recheck is routine for an adult cat.' }
        },
        best: 'info',
        out: {
          info: { tone: 'good', title: 'Good call', m: 'Nothing about Sam is a problem on its own. The file just disagrees with itself: the application says no other pets, but a dog bed and bowl labeled Bruno turned up at the home visit and Bruno came up on the phone. It could be a friend\'s dog, a former pet, or a form mistake. Asking is the right move.', mf: ' You flagged the right row, so your request says what to ask.', warnTitle: 'Right call, one step missing', warnMsg: 'Requesting more information fits. Open Home visit and flag the dog\'s belongings so your request says exactly what to ask about.' },
          approve: { tone: 'warn', title: 'Not yet', m: 'Most of this file is strong, but the application says no other pets and the home visit says otherwise. Marmalade should only go home once that is explained.', mf: ' You caught the mismatch, which is the hard part.', mn: " You also haven't flagged the dog's belongings yet." },
          deny: { tone: 'bad', title: 'More than this case calls for', m: 'An inconsistency is a question, not a verdict. There are plenty of innocent explanations for a dog bed. Ask first.' }
        }
      },

      '0401': {
        animal: 'Pickles', kind: 'Holland lop rabbit, 4 yrs', applicant: 'Grace Lin', submitted: 'Sep 15', status: 'Awaiting documents',
        sub: 'Holland lop rabbit · 4 years · Female · 4 lb',
        animalFacts: [['Species', 'Rabbit'], ['Breed', 'Holland lop'], ['Age', '4 years'], ['Weight', '4.1 lb'], ['Spayed', 'Yes'], ['In care since', 'Feb 2026']],
        applicantFacts: [['Name', 'Grace Lin'], ['City', 'Phoenix, AZ'], ['Submitted', 'Sep 15'], ['Reviewer', 'You (trainee)']],
        app: [
          ['Residence', 'Owns a townhouse. HOA permits rabbits and the approval letter is attached.', 'hoa'],
          ['Rabbit experience', 'Six years. One rabbit at home today, Mochi (3).'],
          ['Why Pickles', '“Mochi lost her bonded partner this spring and has been lonely. Pickles is calm and sweet.”'],
          ['Vet reference', 'Exotic Pet Clinic of Phoenix. Letter attached.'],
          ['Other pets', 'No cats or dogs.'],
          ['Housing plan', 'Rabbit-proofed dining room with a 4 by 6 ft pen and daily supervised free roam.']
        ],
        vet: [
          ['Feb 10', 'Intake exam. Healthy, 4.1 lb.'],
          ['Feb 24', 'Spay. Completed, no complications.'],
          ['Mar 3', 'Vaccines. RHDV2 given.'],
          ['Apr 8', 'Recheck. Mild sniffles, cleared with a 7-day course. No return since.', 'sniffle'],
          ['Sep 9', 'Dental check. Teeth even, no overgrowth. Healthy, 4.1 lb.']
        ],
        home: [
          ['Visit', 'Completed Oct 3 by T. Nguyen, volunteer.'],
          ['Recommendation', 'Approve.'],
          ['Pen and floors', 'Dining room pen is ready. Rugs cover the hard floors for traction, and cords are boxed.'],
          ['Mochi', 'Calm and curious. Greeted the volunteer, then went back to her hay.'],
          ['Introduction plan', 'Pickles and Mochi meet in a neutral room, side-by-side pens first, as the clinic advises.', 'intro'],
          ['Supplies', 'Hay, leafy greens, and a litter box set up.']
        ],
        notes: [
          ['Sep 15', 'Application received.'],
          ['Sep 17', 'Requested vet reference letter and HOA approval.'],
          ['Oct 3', 'Home visit completed.'],
          ['Oct 6', 'Case assigned to you for review.'],
          ['Oct 8', 'Vet letter and HOA approval received. File is complete.']
        ],
        flags: {
          hoa: { note: 'Noted, but the HOA approval letter arrived Oct 8. This one is already settled.' },
          sniffle: { note: 'Noted. It cleared in April with a short course and has not come back, so it is history, not a concern.' },
          intro: { note: 'Noted. Introducing rabbits takes care, and Grace has a clear plan. Nothing is left open.' }
        },
        best: 'approve',
        out: {
          approve: { tone: 'good', title: 'Good call', m: 'The file is complete: the vet letter and HOA approval arrived Oct 8, the vet record has no gaps, and the home visit recommends approval. The status label still said Awaiting documents because nobody updated it. Checking the Notes timeline, not just the label, is the skill here.' },
          info: { tone: 'warn', title: 'Check the timeline', m: 'Nothing is outstanding. The status label has not caught up, but the Notes tab shows both documents arrived Oct 8. Asking again would make Grace resend what she already sent.' },
          deny: { tone: 'bad', title: 'Nothing supports a denial', m: 'The home is rabbit-proofed, the vet history is clean, and the visit recommends approval. Nothing in this file points to no.' }
        }
      },

      '0398': {
        animal: 'Waffles', kind: 'Beagle, 7 yrs', applicant: 'Chris Boyd', submitted: 'Sep 14', status: 'Needs review',
        sub: 'Beagle · 7 years · Male · 24 lb',
        animalFacts: [['Species', 'Dog'], ['Breed', 'Beagle'], ['Age', '7 years'], ['Weight', '24 lb'], ['Neutered', 'Yes'], ['In care since', 'Jul 2026']],
        applicantFacts: [['Name', 'Chris Boyd'], ['City', 'Scottsdale, AZ'], ['Submitted', 'Sep 14'], ['Reviewer', 'You (trainee)']],
        app: [
          ['Residence', 'Owns a ranch home with a fenced yard.'],
          ['Dog experience', 'Grew up with beagles. Waffles would be the first dog as an adult.'],
          ['Why Waffles', '“Seven is not old. Seven is seasoned.”'],
          ['Vet reference', 'Desert Paws Veterinary, on file.'],
          ['Work travel', 'Travels about 10 days a month. Asked who covers Waffles then: “I will figure it out.”', 'travel'],
          ['Schedule', 'Works from a home office the rest of the month.']
        ],
        vet: [
          ['Jul 21', 'Intake exam. Healthy overall, 24 lb.'],
          ['Jul 21', 'Bloodwork. Low thyroid. Started a pill, twice daily.', 'meds'],
          ['Aug 18', 'Recheck. Levels improving. Continue twice-daily dose and retest in 8 weeks.'],
          ['Sep 8', 'Dental cleaning. No extractions.'],
          ['Sep 8', 'Vaccines. Up to date.']
        ],
        home: [
          ['Visit', 'Completed Sep 30 by R. Okafor, volunteer.'],
          ['Recommendation', 'Approve.'],
          ['Yard', 'Fenced. A gap at one corner was patched with a board during the visit.', 'fence'],
          ['Dog space', 'Bed in the living room. Crate set up but unused.'],
          ['Medication', 'Chris keeps a pill chart on the fridge and wrote down the dosing schedule.'],
          ['Sitter', 'No sitter or kennel named when asked.']
        ],
        notes: [
          ['Sep 14', 'Application received.'],
          ['Sep 18', 'Phone interview. Chris asked careful questions about Waffles’s medication and took notes. Did not mention who would cover doses during work travel.'],
          ['Sep 30', 'Home visit completed.'],
          ['Oct 6', 'Case assigned to you for review.']
        ],
        flags: {
          travel: { must: true, note: 'Flagged. Waffles needs a pill twice a day, and there is no plan for the roughly ten days a month Chris is away.' },
          meds: { note: 'Worth knowing, but it is manageable. The real question is whether the applicant has a plan for it.' },
          fence: { note: 'Noted. The gap was patched during the visit, so this one is closed.' }
        },
        best: 'info',
        out: {
          info: { tone: 'good', title: 'Good call', m: 'Chris is a strong fit on paper and takes the medication seriously. The open question is the ten days a month away: Waffles needs a pill twice a day and Chris has no sitter named. Asking for a care plan is exactly the right request.', mf: ' You flagged the travel line, so the next reviewer knows what to ask.', warnTitle: 'Right call, one step missing', warnMsg: 'Requesting more information fits. Open the Application tab and flag the work travel line so your request says what to ask for.' },
          approve: { tone: 'warn', title: 'Close, but not yet', m: "Chris is a strong applicant, but Waffles's medication needs coverage every day and there is no plan for the days Chris is away. Ask first, then approve.", mf: ' You spotted the travel gap, which is the hard part.', mn: " You also haven't flagged the travel line yet." },
          deny: { tone: 'bad', title: 'More than this case calls for', m: 'Travel is not disqualifying, and Chris is clearly attentive. This is a question about a plan, not a reason to say no.' }
        }
      }
    };

var ANIMAL_BIO = {
      '0417': { blurb: 'A 62-pound ball of optimism. Learned “sit” in a day and has been negotiating for treats ever since. Needs a job and a big bed.', tags: ['Energetic', 'Playful', 'Fetch fan'] },
      '0412': { blurb: 'Rules the windowsill like a tiny landlord. Warms up slowly, then purrs at full volume. Prefers laps with a good view.', tags: ['Curious', 'Independent', 'Window-watcher'] },
      '0409': { blurb: 'A loud, loyal corgi with strong opinions about the doorbell and stronger ones about snacks.', tags: ['Loyal', 'Chatty', 'Food-motivated'] },
      '0405': { blurb: 'Orange, opinionated, and very social. Greets every visitor like an old friend and judges them afterward.', tags: ['Social', 'Talkative', 'Lap cat'] },
      '0401': { blurb: 'A calm Holland lop who takes her hay very seriously. Does a happy hop when she thinks no one is watching.', tags: ['Calm', 'Gentle', 'Hay connoisseur'] },
      '0398': { blurb: 'A mellow senior beagle whose nose outranks his manners. Loves a slow sniff walk and a warm spot in the sun.', tags: ['Mellow', 'Nose-driven', 'Likes to sing'] }
    };

var PEOPLE = {
      '0417': { blurb: 'Dog person for twelve years. Leads a weekend trail walk with her pack and has firm views on training.', tags: ['Active', 'Multi-pet home'], home: 'Owns a house, fenced yard', exp: '12 years with dogs' },
      '0412': { blurb: 'Looking for a gentle next chapter after losing a longtime cat. Splits the week between the office and home.', tags: ['Patient', 'Cat person'], home: 'Rents an apartment', exp: '9 years with cats' },
      '0409': { blurb: 'Ready for a short, loud roommate. Keeps a very organized calendar and never misses a vet visit.', tags: ['Organized', 'Dog person'], home: 'Owns a house, fenced yard', exp: 'Lifelong dog owner' },
      '0405': { blurb: 'Works the night shift and wants a daytime companion. Cooks breakfast at dinnertime and wants a critic.', tags: ['Night owl', 'Cat-curious'], home: 'Rents an apartment', exp: 'Grew up with cats' },
      '0401': { blurb: 'Longtime rabbit keeper with a rabbit-proofed dining room and a deep respect for good hay.', tags: ['Rabbit keeper', 'Well prepared'], home: 'Owns a townhouse', exp: '6 years with rabbits' },
      '0398': { blurb: 'Grew up with beagles and works from a home office. Wants a dog who is past the puppy chaos.', tags: ['Home office', 'Beagle fan'], home: 'Owns a house, fenced yard', exp: 'Grew up with beagles' }
    };

var RP = {
      week: {
        chip: 'This week', title: 'Week of Oct 5 to Oct 11, 2026', lineSub: 'Per day', unit: 'day',
        x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        full: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        a: [6, 9, 7, 11, 8, 4, 3], b: [3, 5, 4, 6, 5, 2, 2], max: 12,
        tiles: [
          { label: 'Applications received', value: '48', delta: '+9%', note: 'vs last week', down: false },
          { label: 'Adoptions completed', value: '27', delta: '+4%', note: 'vs last week', down: false },
          { label: 'Days to decision', value: '6.2', delta: '0.8 days faster', note: 'vs last week', down: true },
          { label: 'Approval rate', value: '71%', delta: '+2 pts', note: 'vs last week', down: false }
        ],
        species: [['Cats', 12], ['Dogs', 11], ['Rabbits', 3], ['Other', 1]],
        stages: [['Received to phone interview', 1.4], ['Phone interview to home visit', 3.1], ['Home visit to decision', 1.7]],
        outcomes: [['Approved', 27], ['More info requested', 8], ['Denied', 3]],
        notes: [
          'Thursday was the busiest day, with 11 applications and 6 adoptions.',
          'Applicants wait longest between the phone interview and the home visit, at 3.1 days.',
          'Weekend intake is light, which is typical for the desk.'
        ]
      },
      month: {
        chip: 'Last 4 weeks', title: 'Sep 7 to Oct 4, 2026', lineSub: 'Per week', unit: 'week',
        x: ['Sep 7', 'Sep 14', 'Sep 21', 'Sep 28'],
        full: ['Week of Sep 7', 'Week of Sep 14', 'Week of Sep 21', 'Week of Sep 28'],
        a: [47, 44, 52, 45], b: [29, 27, 33, 26], max: 60,
        tiles: [
          { label: 'Applications received', value: '188', delta: '+6%', note: 'vs prior 4 weeks', down: false },
          { label: 'Adoptions completed', value: '115', delta: '+5%', note: 'vs prior 4 weeks', down: false },
          { label: 'Days to decision', value: '7.4', delta: '0.6 days faster', note: 'vs prior 4 weeks', down: true },
          { label: 'Approval rate', value: '68%', delta: '+2 pts', note: 'vs prior 4 weeks', down: false }
        ],
        species: [['Cats', 52], ['Dogs', 45], ['Rabbits', 12], ['Other', 6]],
        stages: [['Received to phone interview', 1.8], ['Phone interview to home visit', 3.6], ['Home visit to decision', 2.0]],
        outcomes: [['Approved', 115], ['More info requested', 38], ['Denied', 15]],
        notes: [
          'The week of Sep 21 peaked at 52 applications and 33 adoptions.',
          'Cats edged out dogs in completed adoptions, 52 to 45.',
          'Median time to decision improved from 8.0 to 7.4 days.'
        ]
      }
    };


  var TONE = {
    'Needs review': 'tone-review',
    'In progress': 'tone-progress',
    'Awaiting documents': 'tone-docs',
    'Decision recorded': 'tone-done'
  };

  var TABS = [['app', 'Application'], ['vet', 'Vet history'], ['home', 'Home visit'], ['notes', 'Notes']];
  var CHOICES = [['approve', 'Approve'], ['info', 'Request more information'], ['deny', 'Deny']];

  var OUTCOME_TONE = { good: 'tone-good', warn: 'tone-warn', bad: 'tone-bad' };

  function wk(id) {
    var w = state.work[id] || {};
    return { flags: w.flags || {}, decision: w.decision || null };
  }
  function putWork(id, patch) {
    var next = Object.assign({}, state.work);
    next[id] = Object.assign(wk(id), patch);
    return next;
  }
  function statusOf(id) {
    return wk(id).decision ? 'Decision recorded' : CASES[id].status;
  }
  function speciesOf(id) { return CASES[id].animalFacts[0][1]; }
  function onApollo() { return state.screen === 'case' && state.caseId === APOLLO; }

  // ---------- Icons ----------

  var ICON = {
    star: '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" fill="#F2A33A"/></svg>',
    list: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    paw: function (size) {
      return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="10" r="1.6"/><circle cx="12" cy="7" r="1.6"/><circle cx="17" cy="10" r="1.6"/><path d="M8 17c0-2.5 2-4 4-4s4 1.5 4 4c0 1.5-1.5 2-4 2s-4-.5-4-2z"/></svg>';
    },
    person: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/></svg>',
    bars: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>',
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B6770" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></svg>',
    chevron: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    flag: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
    arrow: function (down) {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (down ? ' style="transform: rotate(180deg)"' : '') + '><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    }
  };

  // ---------- Actions ----------

  var actions = {
    startTour: function () { set(Object.assign(fresh(), { tour: true, step: 1 })); },
    closeTour: function () { set({ tour: false }); },
    go: function (screen) { set({ screen: screen, notice: '' }); },
    dismissNotice: function () { set({ notice: '' }); },
    clearDecision: function () { set({ work: putWork(state.caseId, { decision: null }) }); },
    openCase: function (id) {
      set({ screen: 'case', caseId: id, tab: 'app', notice: '', step: (state.tour && state.step === 1 && id === APOLLO) ? 2 : state.step });
    },
    pickTab: function (t) {
      var st = state.step;
      var apollo = state.caseId === APOLLO;
      if (state.tour && apollo && state.step === 2 && t === 'vet') st = 3;
      if (state.tour && apollo && state.step === 4 && t === 'home') st = 5;
      set({ tab: t, notice: '', step: st });
    },
    toggleFlag: function (k) {
      var f = Object.assign({}, wk(state.caseId).flags);
      f[k] = !f[k];
      var st = state.step;
      if (state.tour && state.caseId === APOLLO && state.step === 3 && k === 'vet' && f.vet) st = 4;
      set({ work: putWork(state.caseId, { flags: f }), notice: '', step: st });
    },
    decide: function (d) {
      set({
        work: putWork(state.caseId, { decision: d }),
        notice: '',
        step: (state.tour && state.caseId === APOLLO && state.step === 5) ? 6 : state.step
      });
    },
    showMe: function () {
      var c = state;
      var open = { screen: 'case', caseId: APOLLO, notice: '' };
      if (!onApollo() && c.step >= 2) {
        set(Object.assign(open, { tab: c.step === 2 ? 'app' : (c.step === 5 ? 'home' : 'vet') }));
      } else if (c.step === 1) {
        set(Object.assign(open, { tab: 'app', step: 2 }));
      } else if (c.step === 2) {
        set(Object.assign(open, { tab: 'vet', step: 3 }));
      } else if (c.step === 3) {
        var f = Object.assign({}, wk(APOLLO).flags, { vet: true });
        set(Object.assign(open, { tab: 'vet', step: 4, work: putWork(APOLLO, { flags: f }) }));
      } else if (c.step === 4) {
        set(Object.assign(open, { tab: 'home', step: 5 }));
      }
    },
    setFilter: function (f) { set({ animalFilter: f }); },
    setRange: function (r) { set({ range: r }); },
    toggleTable: function () { set({ table: !state.table }); }
  };

  // ---------- Views ----------

  function btn(action, arg, cls, inner, extra) {
    return '<button type="button" class="' + cls + '" data-action="' + action + '"' +
      (arg != null ? ' data-arg="' + esc(arg) + '"' : '') + (extra || '') + '>' + inner + '</button>';
  }

  function openCount() {
    return ORDER.filter(function (id) { return !wk(id).decision; }).length;
  }

  function sideNav() {
    var s = state.screen;
    function nav(screen, icon, label, extra) {
      var cur = screen === 'queue' ? (s === 'queue' || s === 'case') : s === screen;
      return btn('go', screen, 'navbtn' + (cur ? ' current' : ''), icon + '<span class="grow">' + label + '</span>' + (extra || ''),
        cur ? ' aria-current="page"' : '');
    }
    return '<nav class="sidenav" aria-label="Main navigation">' +
      '<div class="logo">' + ICON.star + '<div><strong>Fourth Wish</strong><span>Adoption Desk</span></div></div>' +
      '<div class="navlist">' +
        nav('queue', ICON.list, 'Queue', '<span class="count">' + openCount() + '</span>') +
        nav('animals', ICON.paw(18), 'Animals') +
        nav('applicants', ICON.person, 'Applicants') +
        nav('reports', ICON.bars, 'Reports') +
      '</div>' +
      '<div class="me"><div class="avatar" aria-hidden="true">TR</div><div><strong>Trainee reviewer</strong><span>Practice account</span></div></div>' +
    '</nav>';
  }

  function topBar() {
    return '<header class="topbar">' +
      '<div class="topbar-left"><span class="practice">Practice environment</span><span class="muted">Nothing here is real. Click anything.</span></div>' +
      '<div class="topbar-right">' +
        btn('startTour', null, 'btn-replay', 'Replay walkthrough') +
        '<a class="btn-ghost" href="../">Back to portfolio</a>' +
      '</div>' +
    '</header>';
  }

  function notice() {
    if (!state.notice) return '';
    return '<div class="notice" role="status"><span>' + esc(state.notice) + '</span>' +
      btn('dismissNotice', null, '', 'Dismiss') + '</div>';
  }

  function pill(status) { return '<span class="pill ' + TONE[status] + '">' + esc(status) + '</span>'; }

  // Queue

  function queueScreen() {
    var q = state.query.trim().toLowerCase();
    var ringRow = state.tour && state.step >= 1 && state.step <= 5;
    var ids = ORDER.filter(function (id) {
      var r = CASES[id];
      return !q || (r.animal + ' ' + id + ' ' + r.applicant + ' ' + r.kind).toLowerCase().indexOf(q) !== -1;
    });

    var rowsHtml = ids.map(function (id) {
      var r = CASES[id];
      var cls = 'qrow' + (id === APOLLO && ringRow ? ' ring-in' : '');
      return btn('openCase', id, cls,
        '<span class="mono muted case-no">#' + id + '</span>' +
        '<span class="who"><b>' + esc(r.animal) + '</b><span>' + esc(r.kind) + '</span></span>' +
        '<span class="hide-sm">' + esc(r.applicant) + '</span>' +
        '<span class="hide-sm muted">' + esc(r.submitted) + '</span>' +
        pill(statusOf(id)));
    }).join('');

    function count(label) { return ORDER.filter(function (id) { return statusOf(id) === label; }).length; }
    var metrics = [['Needs review', 'Needs review'], ['In progress', 'In progress'], ['Awaiting documents', 'Awaiting documents'], ['Decision recorded', 'Decisions recorded']];

    return '<section class="screen" aria-labelledby="queue-title">' +
      '<div><h1 id="queue-title">Adoption queue</h1><p class="sub">Applications waiting on a reviewer.</p></div>' +
      '<div class="stats">' + metrics.map(function (m) {
        return '<div class="card stat"><b>' + count(m[0]) + '</b><span>' + m[1] + '</span></div>';
      }).join('') + '</div>' +
      '<div><label class="search-label" for="queue-search">Search the queue</label>' +
        '<div class="field">' + ICON.search +
          '<input id="queue-search" type="search" value="' + esc(state.query) + '" placeholder="Animal, applicant, or case number" autocomplete="off">' +
        '</div></div>' +
      '<div class="card table">' +
        '<div class="qrow head" aria-hidden="true"><span class="case-no">Case</span><span>Animal</span><span class="hide-sm">Applicant</span><span class="hide-sm">Submitted</span><span>Status</span></div>' +
        rowsHtml +
        (ids.length === 0 ? '<div class="empty">No cases match that search. Try an animal name or a case number.</div>' : '') +
      '</div>' +
    '</section>';
  }

  // Case

  function facts(title, list) {
    return '<div class="card facts"><h2>' + title + '</h2>' +
      list.map(function (f) { return '<div class="fact"><span>' + esc(f[0]) + '</span><span>' + esc(f[1]) + '</span></div>'; }).join('') +
    '</div>';
  }

  function caseRow(cs, w, r) {
    var key = r[2];
    var mono = state.tab === 'vet' || state.tab === 'notes';
    var label = '<span class="' + (mono ? 'mono' : 'k') + '">' + esc(r[0]) + '</span>';
    if (!key) {
      return '<div class="rowwrap"><div class="frow">' + label + '<span>' + esc(r[1]) + '</span></div></div>';
    }
    var on = !!w.flags[key];
    var ring = key === 'vet' && state.tour && state.step === 3 && state.caseId === APOLLO && !on;
    return '<div class="rowwrap flaggable' + (on ? ' on' : '') + '">' +
      '<div class="frow">' + label + '<span>' + esc(r[1]) + '</span>' +
        btn('toggleFlag', key, 'flagbtn' + (ring ? ' ring-out' : ''), ICON.flag + (on ? 'Flagged' : 'Flag'), ' aria-pressed="' + on + '"') +
      '</div>' +
      (on ? '<p class="flagnote">' + esc(cs.flags[key].note) + '</p>' : '') +
    '</div>';
  }

  function tabPanel(cs, w) {
    var t = state.tab;
    return '<div class="panel" role="tabpanel" id="panel-' + t + '" aria-labelledby="tab-' + t + '">' +
      (cs[t] || []).map(function (r) { return caseRow(cs, w, r); }).join('') +
    '</div>';
  }

  function outcome(cs, w) {
    if (!w.decision) return '';
    var o = cs.out[w.decision];
    var flagKeys = Object.keys(cs.flags);
    var mustKeys = flagKeys.filter(function (k) { return cs.flags[k].must; });
    var gotMust = mustKeys.filter(function (k) { return w.flags[k]; }).length;
    var allMust = gotMust === mustKeys.length;
    var noiseOn = flagKeys.filter(function (k) { return !cs.flags[k].must && w.flags[k]; }).length;
    var fc = flagKeys.filter(function (k) { return w.flags[k]; }).length;
    var isBest = w.decision === cs.best;
    var tone = o.tone, title = o.title, message;
    if (isBest && !allMust && o.warnTitle) {
      tone = 'warn'; title = o.warnTitle; message = o.warnMsg;
    } else {
      message = o.m;
      if (mustKeys.length) message += allMust ? (o.mf || '') : (o.mn || '');
      if (isBest && !mustKeys.length && noiseOn) message += ' The flags you raised were already settled elsewhere in the file. Flag what is still open, not everything that looks unusual.';
    }
    var flagLine = mustKeys.length
      ? 'Key issues flagged: ' + gotMust + ' of ' + mustKeys.length
      : 'Flags raised: ' + fc + '. This file had nothing open to flag.';
    return '<div class="outcome ' + OUTCOME_TONE[tone] + '" role="status">' +
      '<div class="title">' + esc(title) + '</div>' +
      '<p>' + esc(message) + '</p>' +
      '<p class="flagline">' + esc(flagLine) + '</p>' +
      btn('clearDecision', null, '', 'Change my decision') +
    '</div>';
  }

  function caseScreen() {
    var id = state.caseId;
    var cs = CASES[id];
    var w = wk(id);
    var fc = Object.keys(w.flags).filter(function (k) { return w.flags[k]; }).length;
    var flagLabel = fc === 0 ? 'No flags' : (fc === 1 ? '1 flag' : fc + ' flags');
    var caseStatus = statusOf(id);
    var onCase = state.tour && onApollo();

    var tabs = TABS.map(function (d) {
      var sel = state.tab === d[0];
      var ring = onCase && ((state.step === 2 && d[0] === 'vet') || (state.step === 4 && d[0] === 'home'));
      return btn('pickTab', d[0], 'tab' + (ring ? ' ring-in' : ''), d[1],
        ' role="tab" id="tab-' + d[0] + '" aria-controls="panel-' + d[0] + '" aria-selected="' + sel + '" tabindex="' + (sel ? '0' : '-1') + '"');
    }).join('');

    var choices = CHOICES.map(function (d) {
      return btn('decide', d[0], 'choice ' + d[0], d[1], ' aria-pressed="' + (w.decision === d[0]) + '"');
    }).join('');

    return '<section class="screen" aria-labelledby="case-title">' +
      btn('go', 'queue', 'back', ICON.chevron + 'Back to queue') +
      '<div class="card case-head">' +
        '<div class="case-id"><div class="case-icon" aria-hidden="true">' + ICON.paw(28) + '</div>' +
          '<div><div class="case-title"><h1 id="case-title">' + esc(cs.animal) + '</h1><span class="mono">Case #' + id + '</span></div>' +
          '<p class="sub" style="margin-top:2px">' + esc(cs.sub) + '</p></div></div>' +
        '<div class="badges">' +
          '<span class="pill badge ' + (fc > 0 ? 'tone-review' : 'tone-docs') + '">' + flagLabel + '</span>' +
          '<span class="pill badge ' + TONE[caseStatus] + '">' + caseStatus + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="cols">' +
        '<aside class="aside">' + facts('Animal', cs.animalFacts) + facts('Applicant', cs.applicantFacts) + '</aside>' +
        '<div class="main-col">' +
          '<div class="card tabs-card"><div class="tablist" role="tablist" aria-label="Case sections">' + tabs + '</div>' + tabPanel(cs, w) + '</div>' +
          '<div class="card decision' + (onCase && state.step === 5 ? ' ring-out' : '') + '">' +
            '<div class="decision-head"><h2>Your decision</h2><span class="muted" style="font-size:13px">' + flagLabel + ' raised</span></div>' +
            '<div class="choices">' + choices + '</div>' +
            outcome(cs, w) +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  // Animals and applicants

  var AV_TINTS = ['av-teal', 'av-gold', 'av-blue', 'av-violet', 'av-rose', 'av-green'];
  var SPECIES_AV = { Dog: 'av-teal', Cat: 'av-gold', Rabbit: 'av-blue' };

  function bioCard(c) {
    return '<article class="card bio">' +
      '<div class="bio-head">' + c.avatar +
        '<div><h2>' + esc(c.name) + '</h2><p class="sub">' + esc(c.sub) + '</p></div></div>' +
      '<div class="bio-meta"><span class="mono muted">Case #' + c.id + '</span>' + pill(c.status) + '</div>' +
      '<p class="bio-text">' + esc(c.blurb) + '</p>' +
      '<div class="tags">' + c.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<div class="bio-facts">' + c.facts.map(function (f) {
        return '<div class="fact"><span>' + esc(f[0]) + '</span><span>' + esc(f[1]) + '</span></div>';
      }).join('') + '</div>' +
      btn('openCase', c.id, 'open-case', 'Open case') +
    '</article>';
  }

  function animalsScreen() {
    var f = state.animalFilter;
    var chips = [['all', 'All animals'], ['Dog', 'Dogs'], ['Cat', 'Cats'], ['Rabbit', 'Rabbits']].map(function (d) {
      return btn('setFilter', d[0], 'chip', d[1], ' aria-pressed="' + (f === d[0]) + '"');
    }).join('');
    var cards = ORDER.filter(function (id) { return f === 'all' || speciesOf(id) === f; }).map(function (id) {
      var cs = CASES[id], b = ANIMAL_BIO[id];
      return bioCard({
        id: id, name: cs.animal, sub: cs.sub, status: statusOf(id), blurb: b.blurb, tags: b.tags,
        avatar: '<div class="bio-av ' + SPECIES_AV[speciesOf(id)] + '" aria-hidden="true">' + ICON.paw(28) + '</div>',
        facts: [['Age', cs.animalFacts[2][1]], ['Weight', cs.animalFacts[3][1]], ['In care since', cs.animalFacts[5][1]]]
      });
    }).join('');
    return '<section class="screen" aria-labelledby="animals-title">' +
      '<div><h1 id="animals-title">Animals</h1><p class="sub">Every animal with an application in the queue. Open a card to jump to its case.</p></div>' +
      '<div class="chips" role="group" aria-label="Filter by species">' + chips + '</div>' +
      '<div class="cards">' + cards + '</div>' +
    '</section>';
  }

  function applicantsScreen() {
    var cards = ORDER.map(function (id, i) {
      var cs = CASES[id], p = PEOPLE[id];
      var initials = cs.applicant.split(' ').map(function (w) { return w.charAt(0); }).join('');
      return bioCard({
        id: id, name: cs.applicant, sub: cs.applicantFacts[1][1], status: statusOf(id), blurb: p.blurb, tags: p.tags,
        avatar: '<div class="bio-av ' + AV_TINTS[i % AV_TINTS.length] + '" aria-hidden="true">' + esc(initials) + '</div>',
        facts: [['Applied for', cs.animal], ['Home', p.home], ['Experience', p.exp]]
      });
    }).join('');
    return '<section class="screen" aria-labelledby="applicants-title">' +
      '<div><h1 id="applicants-title">Applicants</h1><p class="sub">The people behind each application. Open a card to jump to the case.</p></div>' +
      '<div class="cards">' + cards + '</div>' +
    '</section>';
  }

  // Reports (sample data)

  function f1(v) { return String(Math.round(v * 10) / 10); }
  function sum(arr) { return arr.reduce(function (t, v) { return t + v; }, 0); }

  function lineChart(R) {
    var n = R.x.length;
    var L = 44, Rt = 624, T = 16, B = 220;
    function xAt(i) { return L + (i + 0.5) * (Rt - L) / n; }
    function yAt(v) { return B - v / R.max * (B - T); }
    var svg = '<svg class="lines" viewBox="0 0 640 260" role="img" aria-label="' + esc('Line chart of applications and adoptions. ' +
      R.x.map(function (x, i) { return R.full[i] + ' ' + R.a[i] + ' and ' + R.b[i]; }).join('; ')) + '">';
    [0, 1, 2, 3].forEach(function (i) {
      var v = R.max / 3 * i;
      svg += '<line x1="' + L + '" x2="' + Rt + '" y1="' + f1(yAt(v)) + '" y2="' + f1(yAt(v)) + '" stroke="' + (i === 0 ? '#C3C2B7' : '#E1E0D9') + '" stroke-width="1"/>' +
        '<text x="' + (L - 8) + '" y="' + f1(yAt(v) + 4) + '" text-anchor="end" font-size="12" fill="#5B6770">' + Math.round(v) + '</text>';
    });
    svg += '<line class="hline" x1="0" x2="0" y1="' + T + '" y2="' + B + '" stroke="#898781" stroke-width="1" style="display:none"/>';
    function pts(arr) { return arr.map(function (v, i) { return f1(xAt(i)) + ',' + f1(yAt(v)); }).join(' '); }
    svg += '<polyline points="' + pts(R.a) + '" fill="none" stroke="#2a78d6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    svg += '<polyline points="' + pts(R.b) + '" fill="none" stroke="#eb6834" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    R.x.forEach(function (x, i) {
      svg += '<circle class="da-' + i + '" cx="' + f1(xAt(i)) + '" cy="' + f1(yAt(R.a[i])) + '" r="4" fill="#2a78d6" stroke="#fff" stroke-width="2"/>' +
        '<circle class="db-' + i + '" cx="' + f1(xAt(i)) + '" cy="' + f1(yAt(R.b[i])) + '" r="4" fill="#eb6834" stroke="#fff" stroke-width="2"/>' +
        '<text x="' + f1(xAt(i)) + '" y="244" text-anchor="middle" font-size="12" fill="#5B6770">' + esc(x) + '</text>';
    });
    svg += '<line x1="' + L + '" x2="' + Rt + '" y1="' + B + '" y2="' + B + '" stroke="#C3C2B7" stroke-width="1"/></svg>';
    var hits = R.x.map(function (x, i) {
      return '<button type="button" class="hit" data-i="' + i + '" data-x="' + f1(xAt(i)) + '" aria-label="' +
        esc(R.full[i] + ': ' + R.a[i] + ' applications, ' + R.b[i] + ' adoptions') + '"></button>';
    }).join('');
    return '<div class="linewrap">' + svg + '<div class="hits">' + hits + '</div></div>' +
      '<div class="readout" role="status"><span class="ro-hint">Hover or tab to a ' + R.unit + ' for the numbers.</span>' +
        '<span class="ro-when"></span>' +
        '<span class="ro-a"><i style="background:#2a78d6"></i>Applications <b></b></span>' +
        '<span class="ro-b"><i style="background:#eb6834"></i>Adoptions <b></b></span></div>';
  }

  function barBlock(title, sub, items, max, fmt) {
    return '<div class="card chart-card"><h2>' + title + '</h2><p class="sub">' + sub + '</p>' +
      items.map(function (d) {
        var w = Math.max(2, d[1] / max * 82);
        return '<div class="bar-row" role="group" aria-label="' + esc(d[0] + ': ' + fmt(d)) + '" title="' + esc(d[0] + ': ' + fmt(d)) + '">' +
          '<span class="bar-label">' + esc(d[0]) + '</span>' +
          '<span class="bar-track"><span class="bar" style="width:' + w + '%"></span><span class="bar-val">' + esc(fmt(d)) + '</span></span></div>';
      }).join('') + '</div>';
  }

  function reportsScreen() {
    var R = RP[state.range === 'month' ? 'month' : 'week'];
    var chips = [['week', RP.week.chip], ['month', RP.month.chip]].map(function (d) {
      return btn('setRange', d[0], 'chip', d[1], ' aria-pressed="' + (state.range === d[0]) + '"');
    }).join('');
    var tiles = R.tiles.map(function (t) {
      return '<div class="card tile"><div class="tile-label">' + t.label + '</div><div class="tile-value">' + t.value + '</div>' +
        '<div class="tile-delta">' + ICON.arrow(t.down) + '<span>' + t.delta + ' <em>' + t.note + '</em></span></div></div>';
    }).join('');

    var spMax = Math.max.apply(null, R.species.map(function (d) { return d[1]; }));
    var stMax = Math.max.apply(null, R.stages.map(function (d) { return d[1]; }));
    var ouMax = Math.max.apply(null, R.outcomes.map(function (d) { return d[1]; }));
    var ouTotal = sum(R.outcomes.map(function (d) { return d[1]; }));

    var body;
    if (!state.table) {
      body = '<div class="chart-grid">' +
        '<div class="card chart-card wide"><h2>Applications and adoptions</h2><p class="sub">' + R.lineSub + '</p>' +
          '<div class="legend"><span><i style="background:#2a78d6"></i>Applications</span><span><i style="background:#eb6834"></i>Adoptions</span></div>' +
          lineChart(R) + '</div>' +
        barBlock('Adoptions by species', 'Completed adoptions in the period', R.species, spMax, function (d) { return String(d[1]); }) +
        barBlock('Median days in each stage', 'Time from application to decision', R.stages, stMax, function (d) { return f1(d[1]) + ' days'; }) +
        barBlock('Decisions made', 'Reviewer decisions in the period', R.outcomes, ouMax, function (d) { return d[1] + ' (' + Math.round(d[1] / ouTotal * 100) + '%)'; }) +
        '<div class="card chart-card"><h2>What stood out</h2><ul class="notes">' +
          R.notes.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>' +
      '</div>';
    } else {
      var rowsA = R.x.map(function (x, i) { return [R.full[i], R.a[i], R.b[i]]; }).concat([['Total', sum(R.a), sum(R.b)]]);
      var rowsB = [];
      R.species.forEach(function (d) { rowsB.push(['Adoptions by species', d[0], String(d[1])]); });
      R.stages.forEach(function (d) { rowsB.push(['Median days in stage', d[0], f1(d[1]) + ' days']); });
      R.outcomes.forEach(function (d) { rowsB.push(['Decisions made', d[0], String(d[1])]); });
      body = '<div class="chart-grid">' +
        '<div class="card chart-card"><h2>Applications and adoptions</h2><table class="data"><thead><tr><th>Period</th><th>Applications</th><th>Adoptions</th></tr></thead><tbody>' +
          rowsA.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('') + '</tbody></table></div>' +
        '<div class="card chart-card"><h2>Breakdowns</h2><table class="data"><thead><tr><th>Measure</th><th>Item</th><th>Value</th></tr></thead><tbody>' +
          rowsB.map(function (r) { return '<tr><td class="muted">' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '</div>';
    }

    return '<section class="screen" aria-labelledby="reports-title">' +
      '<div class="report-head"><div><h1 id="reports-title">Adoption report</h1><p class="sub">' + R.title + '</p></div>' +
        '<span class="practice">Sample data, not real</span></div>' +
      '<div class="report-controls"><div class="chips" role="group" aria-label="Report period">' + chips + '</div>' +
        btn('toggleTable', null, 'btn-ghost', state.table ? 'Show charts' : 'Show data tables') + '</div>' +
      '<div class="tiles">' + tiles + '</div>' +
      body +
    '</section>';
  }

  // Coach

  function coach() {
    if (!state.tour) return '';
    var step = state.step;
    var apollo = onApollo();
    var offTrack = step >= 1 && step <= 5 && !apollo && !(step === 1 && state.screen === 'queue');
    var stepOf = function (n, name) { return 'Step ' + n + ' of 5 · ' + name; };
    var c;
    if (step === 0) {
      c = { label: 'Welcome', title: 'Welcome to the Adoption Desk', body: "You're a new case reviewer at Fourth Wish, a fictional animal rescue. This is a practice space: nothing here is real and you can't break anything. We'll walk through one case from queue to decision, then every case in the queue is yours to explore.", hint: '' };
    } else if (offTrack) {
      c = { label: 'Pick up where you left off', title: "Back to Apollo's case", body: "The walkthrough continues in Apollo's case (#0417). You can come back to this one any time.", hint: 'Go to the queue and open the highlighted row, or press Show me.' };
    } else if (step === 1) {
      c = { label: stepOf(1, 'Search'), title: "Find Apollo's case", body: 'The queue lists every application waiting on a reviewer. Search for “Apollo” or scan the list, then open case #0417.', hint: 'Click the highlighted row to continue.' };
    } else if (step === 2) {
      c = { label: stepOf(2, 'Review'), title: 'Read the record', body: 'A case is split into tabs. The application tells you who is asking. The vet history tells you about the animal. Start with Vet history.', hint: 'Click the highlighted tab.' };
    } else if (step === 3) {
      c = { label: stepOf(3, 'Flag'), title: 'Spot the gap', body: "The last record is eight months old, and it ends with an X-ray order but no result. That's worth a flag. A flag doesn't decide anything. It tells the next person where to look.", hint: 'Flag the highlighted row.' };
    } else if (step === 4) {
      c = { label: stepOf(4, 'Review'), title: 'Check the home visit', body: 'Does the home visit raise concerns or settle them? Read the summary. Flag anything you think matters. You can unflag it later.', hint: 'Click the highlighted tab.' };
    } else if (step === 5) {
      c = { label: stepOf(5, 'Decide'), title: 'Make the call', body: "You have what you need. Approve, request more information, or deny. There's no penalty for trying all three.", hint: 'Choose an option in the highlighted panel.' };
    } else {
      c = { label: 'Walkthrough complete', title: 'That is the loop', body: 'Search, review, flag, decide. Five more cases are waiting in the queue, and each one has its own twist. Not every file has a problem, so read before you flag.', hint: '' };
    }

    var dots = [1, 2, 3, 4, 5].map(function (i) { return '<span class="dot' + (i <= step ? ' on' : '') + '"></span>'; }).join('');

    var buttons;
    if (step === 0) {
      buttons = btn('startTour', null, 'coach-primary', 'Start walkthrough') + btn('closeTour', null, 'coach-secondary', 'Skip, let me explore');
    } else if ((step >= 1 && step <= 4) || (step === 5 && !apollo)) {
      buttons = btn('showMe', null, 'coach-primary', 'Show me') + btn('closeTour', null, 'coach-secondary', 'Close walkthrough');
    } else if (step === 5) {
      buttons = btn('closeTour', null, 'coach-secondary', 'Close walkthrough');
    } else {
      buttons = btn('startTour', null, 'coach-primary', 'Replay walkthrough') + btn('closeTour', null, 'coach-secondary', 'Close walkthrough');
    }

    return '<div class="coach" role="region" aria-label="Walkthrough" aria-live="polite">' +
      '<div class="coach-copy">' +
        '<div class="coach-label"><span>' + esc(c.label) + '</span><span class="dots" aria-hidden="true">' + dots + '</span></div>' +
        '<div class="coach-title">' + esc(c.title) + '</div>' +
        '<p class="coach-body">' + esc(c.body) + '</p>' +
        (c.hint ? '<p class="coach-hint">' + esc(c.hint) + '</p>' : '') +
      '</div>' +
      '<div class="coach-actions">' + buttons + '</div>' +
    '</div>';
  }

  // ---------- Render ----------

  function focusKey(el) {
    if (!el || !app.contains(el)) return null;
    if (el.id === 'queue-search') return { id: el.id, pos: el.selectionStart };
    if (el.dataset && el.dataset.action) return { action: el.dataset.action, arg: el.dataset.arg };
    return null;
  }

  function restoreFocus(key) {
    if (!key) return;
    var el;
    if (key.id) {
      el = document.getElementById(key.id);
      if (el) {
        el.focus();
        try { el.setSelectionRange(key.pos, key.pos); } catch (e) { /* not supported for this input */ }
      }
      return;
    }
    var sel = '[data-action="' + key.action + '"]' + (key.arg != null ? '[data-arg="' + key.arg + '"]' : ':not([data-arg])');
    el = app.querySelector(sel);
    if (el) el.focus();
  }

  function screenHtml() {
    switch (state.screen) {
      case 'case': return caseScreen();
      case 'animals': return animalsScreen();
      case 'applicants': return applicantsScreen();
      case 'reports': return reportsScreen();
      default: return queueScreen();
    }
  }

  function render() {
    var key = focusKey(document.activeElement);
    app.innerHTML =
      '<div class="shell">' + sideNav() +
        '<div class="content">' + topBar() + notice() +
          '<main id="main">' + screenHtml() + '</main>' +
          coach() +
        '</div>' +
      '</div>';
    restoreFocus(key);
  }

  // The line chart's hover readout updates the page in place, so focus and
  // scroll position are not disturbed.
  function showHover(i) {
    var R = RP[state.range === 'month' ? 'month' : 'week'];
    var chart = app.querySelector('.linewrap');
    if (!chart) return;
    var hit = chart.querySelector('.hit[data-i="' + i + '"]');
    var line = chart.querySelector('.hline');
    if (hit && line) {
      line.setAttribute('x1', hit.dataset.x);
      line.setAttribute('x2', hit.dataset.x);
      line.style.display = '';
    }
    R.x.forEach(function (x, j) {
      var r = j === i ? 6 : 4;
      chart.querySelector('.da-' + j).setAttribute('r', r);
      chart.querySelector('.db-' + j).setAttribute('r', r);
    });
    var ro = app.querySelector('.readout');
    ro.classList.add('on');
    ro.querySelector('.ro-when').textContent = R.full[i];
    ro.querySelector('.ro-a b').textContent = R.a[i];
    ro.querySelector('.ro-b b').textContent = R.b[i];
  }

  function clearHover() {
    var chart = app.querySelector('.linewrap');
    if (!chart) return;
    var line = chart.querySelector('.hline');
    if (line) line.style.display = 'none';
    var dots = chart.querySelectorAll('circle');
    for (var k = 0; k < dots.length; k++) dots[k].setAttribute('r', 4);
    var ro = app.querySelector('.readout');
    if (ro) ro.classList.remove('on');
  }

  app.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el || !app.contains(el)) return;
    var fn = actions[el.dataset.action];
    if (fn) fn(el.dataset.arg);
  });

  app.addEventListener('input', function (e) {
    if (e.target.id === 'queue-search') set({ query: e.target.value });
  });

  app.addEventListener('mouseover', function (e) {
    var h = e.target.closest ? e.target.closest('.hit') : null;
    if (h) showHover(+h.dataset.i);
  });
  app.addEventListener('focusin', function (e) {
    if (e.target.classList && e.target.classList.contains('hit')) showHover(+e.target.dataset.i);
  });
  app.addEventListener('mouseout', function (e) {
    var card = e.target.closest ? e.target.closest('.chart-card') : null;
    if (card && !card.contains(e.relatedTarget)) clearHover();
  });

  // Arrow keys move between case tabs, as in a standard tablist.
  app.addEventListener('keydown', function (e) {
    if (!e.target.matches('[role="tab"]')) return;
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var ids = TABS.map(function (d) { return d[0]; });
    var i = ids.indexOf(e.target.dataset.arg);
    var next = ids[(i + (e.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length];
    e.preventDefault();
    actions.pickTab(next);
    var t = document.getElementById('tab-' + next);
    if (t) t.focus();
  });

  render();
})();
