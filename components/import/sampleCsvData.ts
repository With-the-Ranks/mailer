export function generateSampleCsvData(): string {
  const headers = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "note",
    "tags",
    "defaultAddressCompany",
    "defaultAddressAddress1",
    "defaultAddressAddress2",
    "defaultAddressCity",
    "defaultAddressProvinceCode",
    "defaultAddressCountryCode",
    "defaultAddressZip",
    "defaultAddressPhone",
    "volunteerSkills",
    "availability",
    "preferredContact",
    "yearsActive",
    "lastEngagement",
  ].join(",");

  // City/Province/Zip/Country clusters for grouping
  const cityGroups = [
    {
      city: "Springfield",
      province: "IL",
      zips: ["62701", "62702", "62703"],
      country: "US",
    },
    {
      city: "Chicago",
      province: "IL",
      zips: ["60601", "60602", "60603"],
      country: "US",
    },
    {
      city: "Peoria",
      province: "IL",
      zips: ["61602", "61603", "61604"],
      country: "US",
    },
    {
      city: "Evanston",
      province: "IL",
      zips: ["60201", "60202"],
      country: "US",
    },
    {
      city: "Vancouver",
      province: "BC",
      zips: ["V5K0A1", "V5K0A2"],
      country: "CA",
    },
    {
      city: "Toronto",
      province: "ON",
      zips: ["M4B1B3", "M4B1B4"],
      country: "CA",
    },
    {
      city: "Austin",
      province: "TX",
      zips: ["78701", "78702"],
      country: "US",
    },
    {
      city: "Seattle",
      province: "WA",
      zips: ["98101", "98102"],
      country: "US",
    },
    {
      city: "San Francisco",
      province: "CA",
      zips: ["94102", "94103"],
      country: "US",
    },
    {
      city: "Miami",
      province: "FL",
      zips: ["33101", "33102"],
      country: "US",
    },
  ];

  const companies = [
    "Acme Inc",
    "Open Co",
    "Civic Org",
    "Green Group",
    "Union Local",
    "Care Systems",
    "Global Dynamics",
    "Sunrise Ltd",
    "Blue Sky Foundation",
    "Progress Group",
  ];
  const tagsList = [
    "volunteer;events",
    "donor;supporter",
    "phonebank;canvassing",
    "union;labor",
    "business;leadership",
    "student;new",
    "retired;senior",
    "healthcare;advocacy",
    "parent;education",
    "bilingual;outreach",
  ];
  const skills = [
    "Phone Banking;Event Support",
    "Fundraising;Outreach",
    "Research;Social Media",
    "Campaign Management;Strategy",
    "Education;Mentoring",
    "Healthcare Advocacy;Public Speaking",
    "Technical Support;IT",
    "Logistics;Driver",
    "Legal Research;Policy",
    "Translation;Community Outreach",
  ];
  const contactPref = ["Email", "Phone", "Text"];
  const noteCluster = [
    "Active volunteer",
    "Prefers evening events",
    "Senior member",
    "Interested in leadership",
    "Bilingual skills",
    "Available weekends",
    "Health and wellness focus",
    "Parent volunteer",
    "New member",
    "Union supporter",
  ];

  const data: string[] = [];
  const NUM = 200;

  for (let i = 1; i <= NUM; i++) {
    // Pick a group for address fields
    const group = cityGroups[i % cityGroups.length];
    const zip = group.zips[i % group.zips.length];
    const city = group.city;
    const province = group.province;
    const country = group.country;

    // Cluster other data as before
    const tag = tagsList[i % tagsList.length];
    const skill = skills[i % skills.length];
    const note = noteCluster[i % noteCluster.length];
    const company = companies[i % companies.length];
    const phone = `555-0${String(1000 + i).slice(-4)}`;
    const contact = contactPref[i % contactPref.length];
    const avail =
      i % 2 === 0 ? "Evenings;Weekends" : i % 5 === 0 ? "Flexible" : "Mornings";
    const years = (i % 8) + 1;
    const lastEngagement = `2024-${String((i % 12) + 1).padStart(2, "0")}-${String(
      (i % 27) + 1,
    ).padStart(2, "0")}`;

    data.push(
      [
        `Person${i}`,
        `Last${i}`,
        `person${i}@example.org`,
        phone,
        note,
        tag,
        company,
        `${100 + i} Main St`,
        i % 10 === 0 ? `Apt ${(i % 5) + 1}` : "",
        city,
        province,
        country,
        zip,
        phone,
        skill,
        avail,
        contact,
        years,
        lastEngagement,
      ].join(","),
    );
  }

  return [headers, ...data].join("\n");
}
