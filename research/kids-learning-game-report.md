# Kids' Learning Game: Research Report

*Prepared for Miki, 11 November 2026. Scope: a game that teaches kids useful things, starting with maths. The aim is learning first, with a small target profit.*

*How to read this: every claim has a link to its source. Where sources are weak (vendor blogs, press releases, company-funded studies), the text says so.*

---

## Summary

- **The games that work make the maths the game itself.** In DragonBox you solve equations as a puzzle, and in a well-known study children played a game seven times longer when the maths *was* the gameplay rather than a quiz between levels ([Habgood & Ainsworth](https://shura.shu.ac.uk/3556)). Games that bolt quizzes onto play, the "chocolate-covered broccoli" problem, have failed for 30 years ([Tedium](https://tedium.co/2019/05/09/edutainment-math-blaster-chocolate-covered-broccoli)).
- **Expect modest learning gains, not miracles.** Across many studies, maths games give a small average boost over normal teaching ([Tokac et al., 2019](https://doi.org/10.1111/jcal.12347)). The best results come from short, regular play, a clear learning goal and an adult nearby.
- **The trust failures are about money, not maths.** Prodigy drew a complaint to the US regulator (FTC) for pushing kids toward paid memberships ([EdWeek](https://www.edweek.org/technology/popular-interactive-math-game-prodigy-is-target-of-complaint-to-federal-trade-commission/2021/02)), and ABCmouse paid $10 million over subscriptions that were hard to cancel ([FTC](https://www.ftc.gov/news-events/press-releases/2020/09/childrens-online-learning-program-abcmouse-pay-10-million-settle)). Most young children's apps contain manipulative design ([Michigan Medicine](https://www.michiganmedicine.org/health-lab/design-tricks-commonly-used-monetize-young-childrens-app-use)).
- **The simplest legal path is to collect no personal data.** With no ads, no third-party analytics and no accounts for children, most of COPPA, Canada's rules, Apple's Kids Category and Google's Families policy becomes easy to meet. Purchases must sit behind a parental gate ([Apple](https://developer.apple.com/app-store/review/guidelines/)).
- **Business model: free core plus a low one-time family unlock, with free codes for families who can't pay.** Add school licences later. Parent subscriptions in this market usually cost about $36–$55 a year ([Kahoot! Kids](https://apps.apple.com/us/app/-/id6444439181), [Funexpected](https://apps.apple.com/us/app/funexpected-maths/id1473965253)). Grants can pay for the build.
- **The smallest version worth testing:** one game for ages 7–9 built around the number line, which grows from whole numbers into fractions. It should run for 10-minute sessions, with no accounts and no data collection, plus a printed parent card. Test it on paper first, then in playtests, then in a two-week home pilot with 20–30 families.

---

## 1. What succeeds, what fails, and why

### Successes

| Product | Model | Why it works |
|---|---|---|
| **Prodigy Math** (Canada) | Free game, paid parent membership | Teachers get it free, so it spreads through classrooms. It looks and plays like a real role-playing game ([Wikipedia](https://en.wikipedia.org/wiki/Prodigy_Education)). It was reported at 9 million monthly active users and more than $50M revenue in 2021 ([The Logic](https://thelogic.co/?p=119911)). |
| **DragonBox** (now Kahoot!) | Paid apps, now in a Kahoot! Kids subscription | Algebra rules become puzzle rules, so the maths is the play. A 3,600-student study found higher scores than an active control ([Kahoot!](https://kahoot.com/kahoot-news/research-kahoot-algebra-2-dragonbox-boosted-students-scores/)). An independent study found students enjoyed it more but learned less than with a tutoring system ([AERA Open](https://doi.org/10.1177/23328584231165919)). |
| **Khan Academy Kids** | Free, no ads, no purchases, funded by donors | It is trusted by parents and costs nothing ([Khan Academy](https://districts.khanacademy.org/khan-academy-kids)). The original paid app studio donated its work to the non-profit, with a $3M grant to start ([TechCrunch](https://techcrunch.com/2016/08/26/kids-app-maker-duck-duck-moose-joins-khan-academy/)). A small trial (about 50 children) showed gains in pre-reading skills ([UMass](https://www.umass.edu/news/article/new-educational-app-shows-promise)). |
| **Zearn** | Non-profit; free for families, schools pay | It has a top "Strong" evidence rating based on a RAND trial with a +0.11 standard deviation gain ([Zearn](https://about.zearn.org/press-releases/evidence-for-essa)). |
| **ST Math** | Non-profit; school licences | It uses visual puzzles with little language. It is sold only to schools, at about $3,500 a year per site of around 150 students, a third-party estimate ([Modulo](https://joinmodulo.com/products/st-math), [ST Math FAQ](https://www.stmath.com/faq)). |
| **PBS KIDS maths games** | Public grant funding | Randomised trials found early maths gains in classrooms ([SRI](https://www.sri.com/publication/education-learning-pubs/digital-learning-pubs/preschool-teachers-can-use-a-pbs-kids-transmedia-curriculum-supplement-to-support-young-childrens-mathematics-learning-results-of-a-randomized-controlled-trial/)) and at home when parents joined in ([WestEd](https://www.wested.org/rd_alert_online/digital-media-family-engagement-gains-early-math-learning/)). |
| **Kitkit School** (Enuma, maker of Todo Math) | Prize money and partnerships | It co-won the $10M Global Learning XPRIZE after a 15-month field test with children in Tanzania ([EdSurge](https://www.edsurge.com/news/2019-05-15-the-5-year-15-million-global-learning-xprize-competition-is-over-here-s-who-won), [Phys.org](https://phys.org/news/2019-05-10m-xprize-software-illiterate.html)). |

**Common threads:** the learning goal is clear, kids learn by playing rather than answering quizzes, parents can trust it, and there is a reliable way to reach families, either through schools or by being free.

### Failures and warnings

- **1990s "edutainment."** The game was the reward for doing the boring part, and kids saw through it. Writer Brenda Laurel called this "chocolate-covered broccoli" ([Tedium](https://tedium.co/2019/05/09/edutainment-math-blaster-chocolate-covered-broccoli)). The industry largely collapsed ([Joan Ganz Cooney Center](https://joanganzcooneycenter.org/?p=7057)).
- **Prodigy's membership pressure.** In 2021, 22 advocacy groups complained to the FTC that kids are teased with rewards only members can get, and that the learning claims lacked evidence ([Fairplay](https://fairplayforkids.org/feb-19-2021-advocates-to-ftc-prodigy-math-game-preys-on-kids-and-families/)). The complainants counted 16 membership ads in 19 minutes of play. Prodigy replied that more than 95% of registered users never pay, and that freemium lets it serve millions for free ([NBC News](https://www.nbcnews.com/news/amp/ncna1258294)). No FTC outcome has been reported ([Axios](https://www.axios.com/2021/02/19/prodigy-math-game-ftc-complaint)). The game succeeded, but it lost trust with some parents and teachers.
- **ABCmouse.** The company paid $10M to the FTC over billing without permission and cancellations that more than 100,000 people struggled with ([FTC](https://www.ftc.gov/news-events/press-releases/2020/09/childrens-online-learning-program-abcmouse-pay-10-million-settle)).
- **Amplify (News Corp).** An expensive tablet-plus-curriculum push was wound down after a $371M write-down ([EdWeek Market Brief](https://marketbrief.edweek.org/blog/2015/08/news_corp_announces_plans_to_wind_down_amplifys_tablet_business)). Big budgets did not guarantee adoption.
- **Osmo under Byju's.** Byju's bought Osmo for $120M ([TechCrunch](https://techcrunch.com/2019/01/16/byjus-buys-osmo-for-120m/amp/)). After the parent company's financial collapse, families reported the website and some apps had stopped working ([EdWeek Market Brief](https://marketbrief.edweek.org/financing-investment/lenders-take-bankruptcy-action-against-education-companies-tied-to-byjus/2024/06), [parent blog](https://homeschoolsuperfreak.com/osmo-update/)). **Lesson:** growth funded by debt can strand the families who paid.
- **Duolingo Math as a standalone app** was folded into the main Duolingo app after about a year ([TechCrunch](https://techcrunch.com/2023/09/06/duolingo-confirms-its-app-will-soon-include-both-math-and-music-lessons/)). This is less a failure than a sign that a standalone maths app is hard to sustain even for a big brand.

---

## 2. Making maths feel like play

### What the research says overall

- **Gains are real but small on average.** A maths-specific meta-analysis (a study that combines many studies) found a small positive effect of maths video games over traditional teaching, with an effect size of d = 0.13 ([Tokac et al.](https://doi.org/10.1111/jcal.12347)).
- **Integrating the maths into the game matters.** In *Zombie Division*, children aged 7–11 who played a version where division was the combat learned more, and chose to play it seven times longer, than children given a version with quizzes between levels ([Habgood & Ainsworth, 2011](https://doi.org/10.1080/10508406.2010.508029)).
- **Four pillars of a truly educational app:** active (minds-on), engaged (not distracted), meaningful (linked to real life) and social (shared with others), all serving a clear learning goal ([Hirsh-Pasek et al., 2015](https://www.psychologicalscience.org/publications/educational-apps.html)).
- **Mix up practice.** Mixing problem types ("interleaving") felt harder during practice but nearly doubled test scores in one study ([Scientific American](https://www.scientificamerican.com/article/the-interleaving-effect-mixing-it-up-boosts-learning/)). In a trial across 54 classes it gave a large gain, 61% versus 38% ([Rohrer et al., 2020](https://doi.org/10.1037/edu0000367)).
- **Go easy on speed.** Timed drills may trigger maths anxiety in some children ([Stanford, Boaler](https://ed.stanford.edu/news/learning-math-without-fear)). This is debated, and Boaler still supports practice ([Washington Monthly](https://washingtonmonthly.com/2015/02/09/should-we-stop-making-kids-memorize-times-tables/)). Safest default: make timers optional.

### By age group

**Ages 3–5: counting, "how many," and bigger versus smaller**
- Playing a simple *linear* number board game (squares 1 to 10 in a row) improved low-income preschoolers' counting, number comparison and number-line estimates. A circular board did not ([Siegler & Ramani, 2009](https://www.cmu.edu/dietrich/psychology/cs/research-teaching/docs/SieglerBoardGamesCDPerp2009.pdf); [What Works Clearinghouse review](https://ies.ed.gov/ncee/wwc/study/73725)).
- Use step-by-step learning paths. The *Building Blocks* curriculum, built on these paths and on recognising small amounts at a glance ("subitising"), has strong trial results ([WWC](https://ies.ed.gov/ncee/wwc/Study/77947), [McGraw Hill summary](https://www.mheducation.com/prek-12/resources/research/library/math/early-childhood-mathematics-intervention.html)).
- Design: no reading required, voice prompts, big touch targets, and an adult nearby. This group is well served by free Khan Academy Kids.

**Ages 6–8: adding, subtracting, place value and number sense**
- Parents matter a lot. In a study of 587 first-graders, using a maths story app with a parent once a week raised maths achievement over a school year, especially for children of maths-anxious parents ([UChicago](https://news.uchicago.edu/article/2015/10/08/math-story-time-home-bolsters-achievement-school), [PubMed](https://pubmed.ncbi.nlm.nih.gov/26450209/)). Using it more than twice a week added nothing significant ([EurekAlert](https://www.eurekalert.org/news-releases/594863)).
- Design: short missions, visual models (number lines, blocks), mixed practice, and a co-play moment with a parent.

**Ages 9–12: fractions, division and early algebra**
- Knowing fractions and division in elementary school predicts high-school algebra and overall maths 5–6 years later. This held even after controlling for IQ, family income and other maths knowledge, in both US and UK data ([Siegler et al., 2012](https://www.psychologicalscience.org/news/releases/knowledge-of-fractions-and-long-division-predicts-long-term-math-success.html)).
- DragonBox shows that algebra can be made into puzzle play ([Kahoot!](https://kahoot.com/blog/2023/02/27/dragonbox-algebra-mitigated-learning-loss/)). Even Kahoot!'s own write-up notes that the game alone may not be enough.
- Design: more choice and strategy, harder challenges, building or creating, and social features only if they are safe.

---

## 3. Healthy engagement

### What brings kids back without tricks

- **Meet three basic needs.** Games pull us in when they make us feel in control (autonomy), capable (competence) and connected (relatedness). These needs predict both enjoyment and wanting to play again ([Ryan, Rigby & Przybylski](https://sciencedaily.com/releases/2006/12/061226134706.htm); [Przybylski et al.](https://selfdeterminationtheory.org/wp-content/uploads/2014/04/2009_PrzbylskiRyanRigby_PSPB-1.pdf)).
- **Design for wellbeing.** UNICEF and the LEGO Foundation's research with children aged 8–12 groups wellbeing in digital play into autonomy, competence, emotions, creativity and safety. It also found that children value building, inventing and helping others ([UNICEF Innocenti](https://www.unicef.org/innocenti/projects/responsible-innovation-technology-children), [University of Sheffield](https://sheffield.ac.uk/news/digital-playtime-can-be-good-childrens-well-being-major-new-report-university-sheffield-finds)). The research is funded by the LEGO Foundation.
- **A calm example.** Pok Pok has no points, timers, ads or purchases inside the play, and won a 2023 App Store Award ([App Store](https://apps.apple.com/TR/app/id1550204730), [Screenwise](https://screenwiseapp.com/guides/pok-pok-app)).

### What to avoid

- 95% of apps for children aged 5 and under contained ads, including pop-ups that can't be closed for 20 seconds ([Michigan Medicine](https://www.michiganmedicine.org/health-lab/design-tricks-commonly-used-monetize-young-childrens-app-use)).
- Only 20% of apps used by 3–5-year-olds had *no* manipulative design, and children from lower-income homes saw more of it ([JAMA Network Open, via Deceptive Patterns](https://deceptive.design/articles/prevalence-and-characteristics-of-manipulative-design-in-mobile-applications-used-by-children)).
- The UK Children's Code tells services not to use "nudge" techniques that work against children. It does encourage nudges toward wellbeing, such as taking breaks ([ICO Standard 13](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/13-nudge-techniques/)).

**Practical rules for this game:** clear stopping points ("Mission done, see you tomorrow"), streaks that never punish a missed day, no loot boxes, no countdown timers on offers, no locked rewards teased to kids, and a parent dashboard on the parent's side of the gate.

### Screen-time norms parents expect

- The American Academy of Pediatrics (AAP) used to advise about 1 hour a day of high-quality media for ages 2–5, ideally with a parent ([STAT](https://www.statnews.com/2016/10/21/screen-time-guidelines/)).
- Its January 2026 policy moves away from a single number to the "5 Cs": Child, Content, Calm, Crowding out and Communication ([AAP](https://www.aap.org/en/patient-care/media-and-children/center-of-excellence-on-social-media-and-youth-mental-health/understanding-the-new-AAP-digital-media-guidelines/), [EdSurge](https://edsurge.com/news/2026-02-05-new-aap-screen-time-recommendations-focus-less-on-screens-more-on-family-time)).
- Children aged 0–8 average about 2.5 hours of screens a day. Only 1% of that is homework, but 75% of parents are excited about children learning through digital media ([Common Sense Media, 2025](https://www.commonsensemedia.org/research/the-2025-common-sense-census-media-use-by-kids-zero-to-eight)).
- **Implication:** pitch the game as "10 good minutes," not as more screen time. The trials above used about 20 minutes a day ([UMass](https://www.umass.edu/news/article/new-educational-app-shows-promise)) or just once a week with a parent ([UChicago](https://news.uchicago.edu/article/2015/10/08/math-story-time-home-bolsters-achievement-school)).

---

## 4. The rules

*This is not legal advice. Have a privacy lawyer check the final design.*

| Rule | What it means for us |
|---|---|
| **COPPA (US, under 13)** | You need verified parental consent before collecting children's personal information. The 2025 amendments, fully in force since 22 April 2026, add **separate** consent before sharing data for targeted ads (and access can't depend on it), a written data-retention policy with deletion dates, and a written security programme ([Federal Register](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule), [Jones Day](https://jonesday.com/en/insights/2025/05/ftc-finalizes-amendments-to-coppa--rule), [Davis Polk](https://www.davispolk.com/insights/client-update/ftc-prioritizes-coppa-enforcement-new-compliance-obligations-take-effect)). Device identifiers used only to run the app (for example, saving game progress) are exempt, but behavioural advertising is not ([Covington](https://www.insideprivacy.com/united-states/federal-trade-commission/ftc-adopts-final-coppa-rule/)). |
| **Canada (federal privacy law, PIPEDA)** | The Privacy Commissioner's new Children's Privacy Code (October 2026) says children under 13 generally cannot give meaningful consent, so a parent must. The code is guidance, not law, but the regulator will use it ([Gowling WLG](https://gowlingwlg.com/en/insights-resources/articles/2026/canada-childrens-privacy-code), [Bennett Jones](https://www.bennettjones.com/Insights/Blogs/2026/11/The-New-Canadian-Childrens-Privacy-Code)). Earlier reviews found many educational apps collected too much and gave vague privacy notices ([OPC 2017](https://priv.gc.ca/en/opc-news/news-and-announcements/2017/nr-c_171024), [OPC 2015](https://priv.gc.ca/en/opc-news/news-and-announcements/2015/nr-c_150902)). |
| **Quebec (Law 25)** | Parental consent is needed for children **under 14**, so the line is higher than elsewhere ([CFIB](https://www.cfib-fcei.ca/en/site/qc-law-25), [Consentstack](https://www.consentstack.io/regulations/qc-law25)). French will matter there too. |
| **Apple Kids Category** | No links out of the app and no purchases unless they sit behind a parental gate. No sending personal or device information to third parties. Third-party analytics and ads are generally not allowed, with narrow exceptions ([Guideline 1.3](https://developer.apple.com/app-store/review/guidelines/)). A parental gate is an adult-level task, and it is **not** the same as legal parental consent. Kids Category age bands are 5 and under, 6–8, and 9–11 ([Apple Kids apps](https://developer.apple.com/app-store/kids-apps/)). |
| **Google Play Families** | Apps aimed only at children must not send the advertising ID or other device identifiers, and may not request location. Ads must come only from certified SDKs (third-party code libraries), with no personalised ads. "Emotionally manipulative tactics" to drive purchases are banned, and virtual coins must be clearly different from real money ([Families policy](https://support.google.com/googleplay/android-developer/answer/9893335), [Ads SDK programme](https://support.google.com/googleplay/android-developer/answer/9900633)). Compliant apps can apply for "Teacher Approved," where monetisation is part of the rating ([Google Play](https://play.google.com/console/about/programs/teacherapproved/)). |

**What this means in practice:** the cheapest and safest design is **no child accounts, no personal data, no ads and no third-party analytics**. Progress is saved on the device. Any purchase, link or settings change sits behind a parental gate. If cloud sync or a parent account is added later, it belongs to the parent, collects the minimum, and follows a written retention policy.

---

## 5. Mission-first business models

| Model | Real examples | Keeps it affordable? | Covers costs? |
|---|---|---|---|
| **Paid app (one-time)** | DragonBox apps sold for about $7.99–$19.99 ([GeekDad](https://geekdad.com/2016/12/dragonbox-big-numbers/), [App Store](https://apps.apple.com/us/app/-/id1005050125)) | Yes, pay once with no surprise bills | Hard: a paywall up front limits trials and discovery |
| **Parent subscription** | Kahoot! Kids at $5.99/month or $35.99/year ([App Store](https://apps.apple.com/us/app/-/id6444439181)); Funexpected up to about $54.99/year ([App Store](https://apps.apple.com/us/app/funexpected-maths/id1473965253)) | Medium. Billing and cancellation are where trust breaks ([FTC on ABCmouse](https://www.ftc.gov/news-events/press-releases/2020/09/childrens-online-learning-program-abcmouse-pay-10-million-settle)) | Yes, it is the most predictable income |
| **Freemium (free plus membership)** | Prodigy ([Wikipedia](https://en.wikipedia.org/wiki/Prodigy_Education)) | Free for most | Works, but it is where pressure on kids creeps in ([Fairplay](https://fairplayforkids.org/feb-19-2021-advocates-to-ftc-prodigy-math-game-preys-on-kids-and-families/)) |
| **School licensing** | ST Math (about $3,500 per site per year, estimate) ([Modulo](https://joinmodulo.com/products/st-math)); Zearn (free for families, schools pay) ([Zearn](https://about.zearn.org)) | Yes, free to families | Yes, but sales cycles are slow and schools expect evidence and curriculum fit |
| **Non-profit or grants** | Khan Academy Kids ([EdSurge](https://edsurge.com/news/2016-08-27-khan-academy-buys-children-s-app-developer-duck-duck-moose-for-1)); PBS KIDS ([SRI](https://www.sri.com/publication/education-learning-pubs/digital-learning-pubs/preschool-teachers-can-use-a-pbs-kids-transmedia-curriculum-supplement-to-support-young-childrens-mathematics-learning-results-of-a-randomized-controlled-trial/)) | Yes, fully free | Only while the funding lasts |
| **Pay what you can** | In a theme-park experiment, pay-what-you-want raised the share of people buying but lowered the price paid. Adding a charity element raised what people paid ([Freakonomics](https://freakonomics.com/2010/07/how-to-maximize-pay-what-you-wish-pricing)). Sometimes fewer people buy than at a low fixed price ([PNAS](https://pmc.ncbi.nlm.nih.gov/articles/PMC3358869)) | Yes | Unreliable alone, but a good add-on |

**Funding to build it**
- **US:** the Department of Education's SBIR programme (small-business research grants) explicitly funds games, at up to about $250k for Phase I and $1M for Phase II. It requires a US small business ([SBIR.gov](https://www.sbir.gov/tutorials/individual-agency-requirements/ED), [example maths game award](https://ies.ed.gov/use-work/awards/s3-game-based-3rd-grade-math-curriculum)).
- **Canada:** the Canada Media Fund's Experimental Stream funds interactive projects, and games are its largest share ([CMF](https://cmf-fmc.ca/news/19-5m-awarded-to-31-interactive-digital-media-projects/)). A children's or education track was not confirmed, so check the current rules.

**Store fees:** Apple and Google both take 15% instead of 30% for small developers earning under $1M a year, and 15% on subscriptions ([Appbot](https://appbot.co/blog/app-developers-apple-google-small-business-programs/)).

**Recommended mix**
1. **Free core:** a real, complete game, not a teaser.
2. **One-time "family unlock"** behind a parental gate, at roughly $15–$25. *Test this price; it is not proven.* There is no subscription to forget and no pressure aimed at kids.
3. **"Give a copy" option:** parents can pay a bit more to fund free unlocks for other families. This uses the charity effect above. Free codes go through schools and libraries.
4. **Later:** a low-cost classroom licence, and grants to fund new content and evidence studies.

**Simple break-even check (illustrative):** families needed = yearly costs ÷ (price × 0.85). For example, $40,000 a year of costs at a $20 unlock needs about 2,350 paying families a year, before any profit margin. Plug in real costs once known.

---

## 6. Competitors and gaps

| Competitor | Ages | Price | Strength | Weakness |
|---|---|---|---|---|
| Khan Academy Kids | 2–8 | Free | Trusted, broad, no ads | Mostly younger kids, mixed subjects |
| Prodigy Math | Grades 1–8 | Free plus membership | Fun role-playing game, school reach | Membership pressure ([EdWeek](https://www.edweek.org/technology/popular-interactive-math-game-prodigy-is-target-of-complaint-to-federal-trade-commission/2021/02)) |
| DragonBox / Kahoot! Kids | About 4–14 | Subscription | Best "maths is the game" design | Behind a subscription bundle |
| Funexpected Math | 3–7 | Subscription | Award-winning ([App Store](https://apps.apple.com/us/app/funexpected-maths/id1473965253)) | Some reviews complain about billing ([Common Sense](https://www.commonsensemedia.org/app-reviews/funexpected-math)) |
| Zearn, ST Math | K–8 | Schools pay | Evidence, curriculum fit | Lessons feel more like school |
| Duolingo (maths course) | All ages | Free/subscription | Huge reach ([Duolingo](https://blog.duolingo.com/new-subjects/)) | Streak-driven, not designed for young kids |
| Pok Pok | Preschool | Subscription | Calm design model | Not maths-focused |

**Gaps worth testing**
1. **Calm maths for ages 7–10,** especially fractions. Fractions strongly predict later success ([Siegler 2012](https://www.psychologicalscience.org/news/releases/knowledge-of-fractions-and-long-division-predicts-long-term-math-success.html)), yet calm, game-first options for this age are mostly locked inside subscriptions.
2. **Built-in parent co-play,** since even weekly parent involvement helps ([UChicago](https://news.uchicago.edu/article/2015/10/08/math-story-time-home-bolsters-achievement-school)). Most apps keep parents out except to pay.
3. **Privacy by design, with no accounts at all.** Many educational apps fall short here ([OPC](https://priv.gc.ca/en/opc-news/news-and-announcements/2017/nr-c_171024)).
4. **One fair price,** instead of subscriptions and teased rewards.
5. **Canadian and bilingual (English/French),** with Quebec's under-14 rule designed in from the start.

---

## 7. Recommendation: the smallest version worth testing

### What to build

**A number-line adventure for ages 7–9.** A character travels along a path, and kids place, jump and split distances on it. The path *is* the number line, an idea backed by the board-game studies ([Siegler & Ramani](https://www.cmu.edu/dietrich/psychology/cs/research-teaching/docs/SieglerBoardGamesCDPerp2009.pdf)). The same mechanic later grows into halves, quarters and other fractions.

- **One mechanic, about 15 levels**, with mixed practice built in ([Rohrer](https://doi.org/10.1037/edu0000367)).
- **10-minute sessions** with a clear ending, no timers by default, and no failure screens: wrong moves show *why* on the line.
- **No accounts, no data leaving the device, no ads.** A simple parental gate guards settings.
- **A printed or on-screen "parent card"** with one 2-minute conversation prompt per session.
- Build it as a web or tablet prototype. Do not submit to the app stores yet.

### How to test it (about 8–10 weeks)

**Ethics first:** get written parental consent and the child's own spoken agreement for every session. Don't record without consent, and keep any notes anonymous.

1. **Paper prototype (weeks 1–2): 5–8 children.** Draw the number line on paper and play it as a board game. Check whether kids understand the rules and whether they ask to play again.
2. **Playtests (weeks 3–5): 10–15 children aged 7–9, one at a time with a parent present.** Watch, don't ask: children over-praise, so look at behaviour. Use child-friendly tools such as the Smileyometer (a face rating scale) and the "Again-Again" table, which asks whether they'd play each thing again ([Fun Toolkit](https://experience.aalto.fi/fun-toolkit/), [Read 2008](https://dx.doi.org/10.1007/s10111-007-0069-9)).
3. **Home pilot (weeks 6–9): 20–30 families for 2 weeks.**
   - **Learning:** a 5-minute number-line estimation task before and after, done on paper by the parent.
   - **Engagement:** how many days the child *chose* to play, counted on the device and shared by the parent.
   - **Parents:** a short survey, plus the price question ("Would you pay $X for the full game?") and a real pre-order or "notify me" button.
4. **Decide (week 10).**

**Success signals:**
- Most kids ask to play again without being reminded.
- Estimation scores improve.
- Parents say it felt calm and fair.
- At least some parents pre-order at the test price.

**Where to find testers:** friends and family first, then a school, library or after-school programme. Include families who are worried about maths, since they gain the most ([UChicago](https://news.uchicago.edu/article/2015/10/08/math-story-time-home-bolsters-achievement-school)).

---

## Open questions for Miki

1. **Age band:** are you happy to start at ages 7–9 (number line into fractions), or do you have a specific child or age in mind?
2. **Where:** Canada first (and therefore French and Quebec's rules), the US, or both?
3. **Your target profit:** what yearly cost and profit figure counts as "small"? This sets the price and the number of families needed.
4. **Price model:** does a one-time unlock plus "give a copy" feel right, or would you prefer fully free and grant-funded (a non-profit route)?
5. **Who builds it:** you, a hired developer, or a small studio? Do you need a maths teacher or learning scientist as an adviser?
6. **Platform:** web first (cheapest to test), iPad, or phone?
7. **Testers:** which families, schools or clubs can you reach for playtests?
8. **Evidence:** do you want to aim for a formal study later? Schools and grants will ask for one.
9. **Beyond maths:** which "useful things" come next (money skills, reading, coding, feelings)? This affects whether the game's world is built to grow.
