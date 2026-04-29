import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";

const doctrines = [
  {
    title: "The Holy Bible",
    body:
      "That the Holy Bible, consisting of 39 books of the Old Testament and 27 books of the New Testament, is the inspired Word of God. We take the Bible as final authority in all matters concerning Christian conduct and work.",
    refs: "2 Timothy 3:16-17; Proverbs 30:5-6; Revelation 22:18-19.",
  },
  {
    title: "The Godhead",
    body:
      "That the Godhead consists of three separate, distinct, and recognisable personalities and qualities, perfectly united in one. The Father, the Son, and the Holy Ghost are different Persons in the Godhead, not merely three names for one Person.",
    refs: "Matthew 3:16-17; 2 Corinthians 13:14; Matthew 28:19-20.",
  },
  {
    title: "The Virgin Birth of Jesus",
    body:
      "The virgin birth of Jesus, the only begotten Son of God as well as His crucifixion, death, burial and bodily resurrection.",
    refs: "Isaiah 7:14; Matthew 1:18-25; Romans 1:4; 1 Corinthians 15:3-4.",
  },
  {
    title: "Total Depravity, Sinfulness and Guilt of All Men",
    body:
      "The total depravity, sinfulness and guilt of all men since the Fall, rendering them subject to God's wrath and condemnation.",
    refs:
      "Psalm 51:5; Job 14:4; Romans 3:23; 5:12-17; Mark 7:21-23; Ephesians 2:1.",
  },
  {
    title: "Repentance",
    body:
      "That Repentance is a complete turning away from all sins and its deceitful pleasures and that it is required from every sinner before he can truly and effectively believe in Jesus with saving faith.",
    refs:
      "Proverbs 28:13; Isaiah 55:7; Ezekiel 18:21-23; Mark 1:15; Luke 24:46-47; Acts 2:38; 3:19; 20:20-21; 2 Corinthians 7:10; Hebrews 6:1-3.",
  },
  {
    title: "Restitution",
    body:
      "That Restitution is making amends for wrongs done against our fellow-men, restoring stolen things to their rightful owners, paying debts, giving back where one has defrauded, making confessions to the offended and apologizing to those slandered so as to have a conscience void of offence toward God and man.",
    refs:
      "Genesis 20:1-8,14-18; Exodus 22:1-7; Leviticus 6:1-7; Numbers 5:6-8; 2 Samuel 12:1-6; Proverbs 6:30-31; Ezekiel 33:14-16; Matthew 5:23-24; Luke 19:8-9; Acts 23:1-5; 24:16; James 4:17.",
  },
  {
    title: "Justification",
    body:
      "That Justification is God's grace through which one receives forgiveness and remission of sins and is counted righteous before God, through faith in the atoning blood of Jesus. Having thus been cleared of every guilt of sin, the regenerated stands before God as though he had never sinned.",
    refs: "Psalm 32:1-2; Isaiah 1:18; Micah 7:19; Acts 13:38.",
  },
  {
    title: "Water Baptism",
    body:
      'That water Baptism is essential to our obedience after reconciliation with God. Water Baptism is one immersion (not three) "In the name of the Father, and of the Son, and of the Holy Ghost", as Jesus commanded.',
    refs: "Matthew 28:19; 3:13-17; Mark 16:15-16; Acts 2:38; 8:38-39; 19:1-5; Romans 6:4-5.",
  },
  {
    title: "The Lord's Supper",
    body:
      'That the Lord\'s supper was instituted by Jesus Christ so that all believers might partake thereof regularly, to "shew the Lord\'s death till he come".',
    refs: "Matthew 26:29; Luke 22:17-20; 1 Corinthians 11:23-30.",
  },
  {
    title: "Entire Sanctification",
    body:
      "That Entire Sanctification is a definite act of God's grace, subsequent to the New Birth, by which the believer's heart is purified and made holy.",
    refs:
      "Luke 1:74-75; John 17:15-17; 1 Thessalonians 4:3,7-8; 5:22-24; Hebrews 12:14; 1 Peter 1:14-16.",
  },
  {
    title: "Holy Ghost Baptism",
    body:
      "That the Baptism in the Holy Ghost is the enduement of power from on High upon the sanctified believer, accompanied by the initial evidence of speaking a language unlearned previously.",
    refs:
      "Matthew 3:11; Acts 1:8; Luke 24:49; Acts 2:1-18; 10:44-46; 19:1-6; 1 Corinthians 12:1-31.",
  },
  {
    title: "Redemption, Healing and Health",
    body:
      "That Redemption from the curse of the law, Healing of sickness and disease as well as continued Health are provided for all people through the sacrificial death of Jesus Christ.",
    refs:
      "Exodus 15:26; Isaiah 53:4-5; Matthew 8:16-17; James 5:14-16; 3 John 2; Galatians 3:13-14.",
  },
  {
    title: "Personal Evangelism",
    body:
      "That Personal Evangelism is a God-given and God-ordained ministry for every believer. Jesus commanded and God requires every believer to be a compassionate and fruitful soulwinner.",
    refs:
      "Matthew 28:19-20; Mark 16:15; Luke 24:46-49; Acts 1:8; Proverbs 11:30; Daniel 12:3.",
  },
  {
    title: "Marriage",
    body:
      "That Marriage is binding for life. Monogamy is the uniform teaching of the Bible and under the New Testament dispensation, no one has a right to divorce and remarry while the first companion lives.",
    refs:
      "Genesis 2:24; Romans 7:2-3; Ephesians 5:31-33; Matthew 19:3-9; Mark 10:2-12.",
  },
  {
    title: "The Rapture",
    body:
      'That the Rapture is the catching away from the earth of all living saints and all who died in the Lord before the Great Tribulation, and it can happen any time from now.',
    refs:
      "John 14:1-3; Luke 21:34-36; 1 Corinthians 15:51-58; 1 Thessalonians 4:13-18; 5:4-9.",
  },
  {
    title: "The Resurrection of the Dead",
    body:
      "That the Resurrection of the dead is taught in the Bible as clearly as the immortality of the soul. Every individual who has ever lived will be resurrected, some to honour and glory and others to everlasting shame.",
    refs:
      "Daniel 12:2; John 5:28-29; 1 Corinthians 15:12-57; Revelation 20:4,6,12-13.",
  },
  {
    title: "The Great Tribulation",
    body:
      'That the Great Tribulation will occur after the Rapture and will be a time of terrible suffering on earth under the reign of the Antichrist.',
    refs:
      "Matthew 24:21-22,29; Mark 13:19; 2 Thessalonians 2:3-12; Revelation 13; Revelation 19:1-10.",
  },
  {
    title: "The Second Coming of Christ",
    body:
      "That the Second Coming of Christ will be just as literal and visible as His going away, and He is coming to execute judgement upon the ungodly and set up His Kingdom.",
    refs:
      "Zechariah 14:3-4; Matthew 25:31-46; Mark 13:24-37; 2 Thessalonians 1:7-10; Jude 14-15.",
  },
  {
    title: "Christ's Millennial Reign",
    body:
      "That Christ's Millennial Reign is the 1,000 years literal reign of Jesus on earth, ushered in by His coming back to earth with ten thousands of His saints.",
    refs:
      "Revelation 20:2-3; Isaiah 11:6-9; Hosea 2:18; Zechariah 14:9-20; Isaiah 2:2-4.",
  },
  {
    title: "The Great White Throne Judgement",
    body:
      "That the Great White Throne Judgement is when God finally judges all who have ever lived on the face of the earth according to their works.",
    refs:
      "John 5:28-29; Romans 14:12; Acts 10:42; Revelation 20:11-15.",
  },
  {
    title: "The New Heaven and The New Earth",
    body:
      'That the New Heaven and the New Earth "wherein dwelleth righteousness" will be made by God and the redeemed shall dwell therein with God forever.',
    refs:
      "2 Peter 3:10-13; Revelation 21:1-7; Revelation 22:1-5.",
  },
  {
    title: "Hell",
    body:
      "That Hell fire is a place of everlasting punishment where sinners who do not have their names in the book of life will suffer torments for ever and ever.",
    refs:
      "Matthew 25:46; Luke 16:19-31; Mark 9:43-47; Revelation 20:10,12,15.",
  },
];

export default function BeliefsPage({ user }) {
  return (
    <div className="public-home beliefs-page-premium">
      <SEO
        title="What We Believe"
        description="Our list of Bible doctrines including The Holy Bible, The Godhead, Virgin Birth, and more."
      />
      <PublicNav user={user} />

      <section
        className="public-hero home-hero home-hero-refined beliefs-page-hero"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(4, 10, 18, 0.98) 0%, rgba(4, 10, 18, 0.9) 34%, rgba(7, 15, 25, 0.48) 58%, rgba(7, 15, 25, 0.16) 100%), url("/beliefs-hero-premium.png")',
        }}
      >
        <div className="home-hero-refined__inner">
          <div className="public-hero-content home-hero-refined__content">
            <p className="public-kicker home-hero-refined__kicker">Bible Doctrines</p>
            <h1>
              What We <span>Believe</span>
            </h1>
            <p>
              "Beloved, when I gave all diligence to write unto you of the common salvation, it was needful for me to
              write unto you, and exhort you that ye should earnestly contend for the faith which was once delivered
              unto the saints." (Jude 3)
            </p>
            <div className="public-cta-row home-hero-refined__actions">
              <Link className="public-btn primary" to="/about">About DLCF</Link>
              <Link className="public-btn ghost" to="/states">Find a Fellowship</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-values-band" aria-label="Belief page summary">
        <div className="hero-values-band__inner">
          <article className="hero-value-item">
            <span className="hero-value-item__icon">✚</span>
            <div>
              <h3>Scripture</h3>
              <p>The Bible is our final authority in doctrine and practice.</p>
            </div>
          </article>
          <article className="hero-value-item">
            <span className="hero-value-item__icon">◉</span>
            <div>
              <h3>Salvation</h3>
              <p>We preach repentance, faith, holiness, and transformed living.</p>
            </div>
          </article>
          <article className="hero-value-item">
            <span className="hero-value-item__icon">◎</span>
            <div>
              <h3>Power</h3>
              <p>We believe in sanctification, the Spirit’s power, and mission.</p>
            </div>
          </article>
          <article className="hero-value-item">
            <span className="hero-value-item__icon">◆</span>
            <div>
              <h3>Hope</h3>
              <p>We look toward Christ’s coming kingdom and eternal glory.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="public-section beliefs-intro">
        <div className="callout__inner beliefs-intro__inner">
          <p className="section-kicker">Bible Doctrines: Abridged Edition</p>
          <h2>God's infallible Word teaches and we believe</h2>
          <p>
            Take heed unto thyself, and unto the doctrine; continue in them: for in doing this thou shalt both save
            thyself, and them that hear thee. (1 Timothy 4:16)
          </p>
        </div>
      </section>

      <section className="public-section beliefs-doctrine-section">
        <div className="beliefs-doctrine-grid">
          {doctrines.map((item) => (
            <article key={item.title} className="beliefs-doctrine-card">
              <div className="beliefs-doctrine-card__head">
                <h3>{item.title}</h3>
              </div>
              <p>{item.body}</p>
              <span>{item.refs}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="public-section callout callout--premium beliefs-final-cta">
        <div className="callout__inner beliefs-final-cta__inner">
          <p className="section-kicker">Stand Firm in the Faith</p>
          <h2>Grow deeper in doctrine and discipleship</h2>
          <p>Explore our About page, find a local fellowship, and continue in the teaching of God’s Word.</p>
          <div className="public-cta-row callout__actions">
            <Link className="public-btn primary" to="/about">About DLCF</Link>
            <Link className="public-btn ghost" to="/states">Browse States</Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
