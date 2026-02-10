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
      "That Justification is God's grace through which one receives forgiveness and remission of sins and is counted righteous before God, through faith in the atoning blood of Jesus. Having thus been cleared of every guilt of sin, the regenerated stands before God as though he had never sinned, not on the basis of any personal merit but in the light of what Christ had accomplished for mankind by His substitutionary death on the cross at Calvary.",
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
      'That the Lord\'s supper was instituted by Jesus Christ so that all believers (all members of the family of God) might partake thereof regularly, to "shew the Lord\'s death till he come". The emblems used are "unleavened bread" and the juice of "fruit of the vine". Anyone who eats and drinks unworthily brings "damnation", punishment and chastisement upon himself.',
    refs: "Matthew 26:29; Luke 22:17-20; 1 Corinthians 11:23-30.",
  },
  {
    title: "Entire Sanctification",
    body:
      "That Entire Sanctification is a definite act of God's grace, subsequent to the New Birth, by which the believer's heart is purified and made holy. It cannot be attained progressively by works, struggle or suppression, but it is obtained by faith in the sanctifying blood of Jesus Christ. Holiness of life and purity of heart are central to Christian living.",
    refs:
      "Luke 1:74-75; John 17:15-17; 1 Thessalonians 4:3,7-8; 5:22-24; Ephesians 5:25-27; Hebrews 2:11; 10:10,14; 13:11-12; Titus 2:11-14; 1 John 1:7; Hebrews 12:14; 1 Peter 1:14-16.",
  },
  {
    title: "Holy Ghost Baptism",
    body:
      "That the Baptism in the Holy Ghost is the enduement of power from on High upon the sanctified believer. It is the promise of the Father and when one receives this gift of the Holy Ghost, it is accompanied by the initial evidence of speaking a language unlearned previously, referred to as speaking in tongues as the Spirit gives utterance. We do not teach or instruct people how to speak in tongues: the Holy Spirit gives utterance. We also stress the necessity of purity before power. The Gifts of the Spirit are for believers today.",
    refs:
      "Matthew 3:11; Acts 1:8; Luke 3:16; 24:49; John 1:30-33; 7:37-39; 14:16-17,26; 15:26; 16:12-15; Acts 1:5-8; Mark 16:17; Acts 2:1-18; 10:44-46; 19:1-6; 1 Corinthians 12:1-31; 14:1-40.",
  },
  {
    title: "Redemption, Healing and Health",
    body:
      "That Redemption from the curse of the law, Healing of sickness and disease as well as continued Health are provided for all people through the sacrificial death of Jesus Christ.",
    refs:
      "Exodus 15:26; Deuteronomy 7:15; Psalm 103:1-5; Proverbs 4:20-22; Isaiah 53:4-5; Matthew 8:16-17; 1 Peter 2:24; Mark 16:15-18; Luke 13:16; John 14:12-14; 10:10; Acts 10:38; James 5:14-16; 3 John 2; Galatians 3:13-14.",
  },
  {
    title: "Personal Evangelism",
    body:
      "That Personal Evangelism is a God-given and God-ordained ministry for every believer. Jesus commanded and God requires every believer to be a compassionate and fruitful soulwinner, bringing others to Christ.",
    refs:
      "Matthew 28:19-20; Mark 16:15; Luke 24:46-49; John 17:18; Acts 1:8; 1-4; Psalm 126:5-6; Proverbs 11:30; Daniel 12:3; Ezekiel 3:17-21.",
  },
  {
    title: "Marriage",
    body:
      "That Marriage is binding for life. Monogamy is the uniform teaching of the Bible. Polygamy is contrary to God's perfect will and institution. Also, under the New Testament dispensation, no one has a right to divorce and remarry while the first companion lives. When a person becomes converted, necessary restitution on this line must be done without delay if he has married wrongly.",
    refs:
      "Genesis 2:24; Deuteronomy 7:1-4; Job 23:11-13; 2 Corinthians 6:14-18; Proverbs 31:10-31; Malachi 2:14-15; Romans 7:2-3; Ephesians 5:31-33; Matthew 5:31-32; 19:3-9; Mark 10:2-12; Luke 16:18; John 4:15-19; Genesis 20:3-7.",
  },
  {
    title: "The Rapture",
    body:
      'That the Rapture (commonly referred to as the first phase or stage of the Second Coming of Christ) is the catching away from the earth of all living saints and all who died in the Lord. The Rapture will take place before the Great Tribulation and can happen any time from now. "In a twinkling of an eye" without a moment\'s warning, "the trumpet shall sound" "and the dead in Christ shall rise first; then we which are alive and remain shall be caught up together with them in the clouds, to meet the Lord in the air: and so shall we ever be with the Lord."',
    refs:
      "John 14:1-3; Luke 21:34-36; 1 Corinthians 15:51-58; 1 Thessalonians 4:13-18; 5:4-9; 2 Thessalonians 2:5-7; Philippians 3:11,20-21; 1 John 3:1-3.",
  },
  {
    title: "The Resurrection of the Dead",
    body:
      "That the Resurrection of the dead is taught in the Bible as clearly as the immortality of the soul. Every individual who has ever lived will be resurrected, some to honour and glory and others to everlasting shame and contempt.",
    refs:
      "Job 19:25-27; Psalm 71:20; Isaiah 26:19; Daniel 12:2; John 5:28-29; 1 Corinthians 15:12-57; 1 Thessalonians 4:13-16; Hebrews 6:1-2; Philippians 3:8-11; Revelation 20:4,6,12-13.",
  },
  {
    title: "The Great Tribulation",
    body:
      'That the Great Tribulation will occur after the Rapture and will be a time of terrible suffering on earth. It is also referred to as the time of "Jacob\'s trouble". During this time, the Antichrist will take possession of this world for a reign of terror. He will not be a system or organization but a person - a supernatural, diabolical being, in the form of a man who will blaspheme and proclaim himself to be God. The Marriage Supper of the Lamb will take place above while the Tribulation continues on earth.',
    refs:
      "Matthew 24:21-22,29; Revelation 9:16; Mark 13:19; 2 Thessalonians 2:3-12; Revelation 13; Daniel 8:23-25; Revelation 19:1-10.",
  },
  {
    title: "The Second Coming of Christ",
    body:
      "That the Second Coming of Christ will be just as literal and visible as His going away, and He is coming to execute judgement upon the ungodly. He will also, then, set up His Kingdom and reign on this present earth for a thousand years.",
    refs:
      "Zechariah 14:3-4; Matthew 25:31-46; 26:64; Mark 13:24-37; 2 Thessalonians 1:7-10; 2:8; Jude 14-15.",
  },
  {
    title: "Christ's Millennial Reign",
    body:
      "That Christ's Millennial Reign is the 1,000 years literal reign of Jesus on earth, which will be ushered in by the coming of Jesus back to earth with ten thousands of His saints. At this time He will judge the nations that dwell upon the face of the earth. During this time, the devil will be bound. It will be a reign of peace and blessing.",
    refs:
      "Jude 14-15; 2 Thessalonians 1:7-10; Revelation 20:2-3; Isaiah 11:6-9; 65:25; Hosea 2:18; Zechariah 14:9-20; Isaiah 2:2-4.",
  },
  {
    title: "The Great White Throne Judgement",
    body:
      "That the Great White Throne Judgement is when God finally judges all (the living and the dead, small and great) who have ever lived on the face of the earth, according to their works. This is after the Millennium. At this time, the final Judgement known as the Great White Throne Judgement will be held. All those, from all ages, who have not yet been judged (believers' judgement for sin, borne and accomplished by Christ on the Cross) will stand before God at this time. The devil and his angels are judged at this time also and sent to the lake of fire forever.",
    refs:
      "John 5:24; 3:17-19; Daniel 12:2-3; Matthew 10:15; 11:21-24; 12:41-42; John 5:28-29; Romans 2:15-16; 14:12; 2 Peter 2:9; Jude 6; 1 Corinthians 6:1-4; Acts 10:42; Revelation 20:11-15.",
  },
  {
    title: "The New Heaven and The New Earth",
    body:
      'That the New Heaven and the New Earth "wherein dwelleth righteousness" will be made by God and the redeemed shall dwell therein with God forever. This present earth which has been polluted by sin will pass away after the Great White Throne Judgement. No unclean thing will be there. There, we shall know each other, our knowledge having been perfected. There will be no more curse upon anything. There will be no more night; the glory of the Lord will be the light thereof.',
    refs:
      "Psalm 102:25-26; Isaiah 51:6; 65:17; Matthew 5:18; 24:35; 2 Peter 3:10-13; Revelation 21:1; Isaiah 66:22; 2 Peter 3:12-13; 1 Corinthians 13:12; 1 John 3:2-3; Revelation 21:1-7; 22:1-5.",
  },
  {
    title: "Hell",
    body:
      "That Hell fire is a place of everlasting punishment where sinners (all who do not have their names in the book of life) will suffer torments for ever and ever. It was prepared for the devil and his angels (Matthew 25:41) but God has decreed that the wicked and those who forget Him and reject Christ will also be cast there because of their sin and neglect of His salvation.",
    refs:
      "Psalm 9:17; Matthew 25:46; Luke 12:4-5; 16:19-31; Matthew 5:22,30; Mark 9:43-47; Revelation 14:10-11; 20:10,12,15.",
  },
];

export default function BeliefsPage({ user }) {
  return (
    <div className="public-home">
      <SEO
        title="What We Believe"
        description="Our list of Bible doctrines including The Holy Bible, The Godhead, Virgin Birth, and more."
      />
      <PublicNav user={user} />

      <section className="public-hero media-hero">
        <div className="public-hero-content">
          <p className="public-kicker">Bible Doctrines</p>
          <h1>
            What We <span>Believe</span>
          </h1>
          <p>
            "Beloved, when I gave all diligence to write unto you of the common salvation, it was
            needful for me to write unto you, and exhort you that ye should earnestly contend for the
            faith which was once delivered unto the saints." (Jude 3)
          </p>
          <p>
            "Take heed unto thyself, and unto the doctrine; continue in them: for in doing this thou
            shalt both save thyself, and them that hear thee." (1 Timothy 4:16)
          </p>
          <p>
            "Now I beseech you, brethren, mark them which cause divisions and offences contrary to the
            doctrine which ye have learned; and avoid them." (Romans 16:17)
          </p>
          <p className="lede">Acts 2:42; 1 Timothy 4:16; Titus 1:9</p>
        </div>
      </section>

      <section className="public-section">
        <div className="section-head">
          <div>
            <p className="section-kicker">Bible Doctrines: Abridged Edition</p>
            <h2>God's infallible Word teaches and we believe</h2>
          </div>
        </div>
        <div className="states-grid" style={{ gridTemplateColumns: "1fr" }}>
          {doctrines.map((item) => (
            <div key={item.title} className="state-tile" style={{ display: "block", textAlign: "left", padding: "2rem" }}>
              <h3>{item.title}</h3>
              <p style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>{item.body}</p>
              <p style={{ fontSize: "0.95rem", color: "#97a3b6" }}>{item.refs}</p>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
