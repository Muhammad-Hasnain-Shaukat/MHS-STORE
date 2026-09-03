// MHS STORE - Complete Luxury Catalog with 100% Unique Names & Prices
export const CATALOG = [
  // =========================================================================
  // HERO INTRO (PURE TITLE ANIMATION)
  // =========================================================================
  {
    id: "hero-title",
    department: "Hero",
    subCategory: "title",
    navLabel: "Intro",
    title: "MHS Luxury Universe",
    videoSrc: "MHS Title video/MHS Store title.mp4",
    timelineItems: [] // Pure video animation on homepage without pill overlays
  },

  // =========================================================================
  // MALE COLLECTION (6 SECTIONS)
  // =========================================================================
  {
    id: "male-watches",
    department: "Male",
    subCategory: "watches",
    navLabel: "Watches",
    title: "Haute Horlogerie & Timepieces",
    videoSrc: "Male/Male watches.mp4",
    startOffset: 0.6,
    timelineItems: [
      { 
        start: 0.00, end: 0.20, id: "male-watch-01", 
        title: "Apex Skeleton Rose Gold Tourbillon", 
        price: 890, 
        tag: "Open-Worked Caliber", 
        image: "Male/Male watches detail/Apex Skeleton Rose Gold detail.webp",
        description: "Hand-finished in 18K rose gold, the Apex Skeleton Tourbillon showcases an exposed flying tourbillon cage with Guilloché sunburst dial texture, blued screws, and a bespoke alligator leather strap.",
        specs: {
          "Movement": "Automatic Co-Axial Skeleton Tourbillon (42h Reserve)",
          "Case": "42mm Polished 18K Rose Gold & Sapphire Back",
          "Dial": "Open-Worked Architecture with Guilloché Silver Finish",
          "Strap": "Hand-Stitched Genuine Brown Alligator with Deployant Clasp",
          "Water Resistance": "50M / 5 ATM"
        }
      },
      { 
        start: 0.20, end: 0.40, id: "male-watch-02", 
        title: "Royal Blue Sunburst Chronometer", 
        price: 1150, 
        tag: "Sunburst Blue & Steel Links", 
        image: "Male/Male watches detail/royal blue sunburst detail.webp",
        description: "A pinnacle of maritime chronometry, featuring a deep azure sunburst dial, luminescent indices, and a hand-polished 316L medical-grade stainless steel bracelet.",
        specs: {
          "Movement": "COSC-Certified Master Chronometer Caliber MHS-8800",
          "Case": "41mm 316L Brushed & Polished Stainless Steel",
          "Dial": "Electric Royal Blue Sunburst with Rhodium-Plated Hands",
          "Bracelet": "Solid 5-Link Stainless Steel with Micro-Adjustment",
          "Water Resistance": "100M / 10 ATM"
        }
      },
      { 
        start: 0.40, end: 0.60, id: "male-watch-03", 
        title: "Vanguard Obsidian Ceramic GMT", 
        price: 1280, 
        tag: "Dual-Time Ceramic Bezel", 
        image: "Male/Male watches detail/vanguard obsidian detail.webp",
        description: "Engineered for global travelers, combining dual-timezone complications, dual balance wheels, and a warm cognac calfskin strap.",
        specs: {
          "Movement": "In-House Dual-Time GMT Automatic Complication",
          "Case": "43mm Rose Gold with Scratch-Resistant Ceramic Ring",
          "Dial": "Multi-Tiered Champagne Dial with Dual Sub-Dial Tourbillons",
          "Strap": "Cognac Full-Grain Italian Calfskin with Contrast Stitching",
          "Water Resistance": "50M / 5 ATM"
        }
      },
      { 
        start: 0.60, end: 0.80, id: "male-watch-04", 
        title: "Imperial Gold Dress Chronometer", 
        price: 1450, 
        tag: "Hand-Stitched Alligator", 
        image: "Male/Male watches detail/imperial gold detail.webp",
        description: "A commanding statement in two-tone luxury, featuring a fluted rose gold bezel, onyx black guilloché dial, exposed tourbillon regulator, and two-tone steel bracelet.",
        specs: {
          "Movement": "High-Frequency Manual-Wind Tourbillon Chronometer",
          "Case": "40mm Dual-Tone 18K Rose Gold & Stainless Steel",
          "Dial": "Onyx Black with Applied Rose Gold Roman Numerals",
          "Bracelet": "Integrated Bi-Color Gold-Steel Link Bracelet",
          "Water Resistance": "50M / 5 ATM"
        }
      },
      { 
        start: 0.80, end: 1.00, id: "male-watch-05", 
        title: "Celestial Grand Complication Perpetual", 
        price: 1750, 
        tag: "Astronomical Moonphase", 
        image: "Male/Male watches detail/Celestial Grand Complication detail.webp",
        description: "The pinnacle of Haute Horlogerie. A fully skeletonized masterpiece revealing gold bridges, column-wheel chronograph, and astronomical precision movement.",
        specs: {
          "Movement": "Grand Complication Full Skeleton Perpetual Movement",
          "Case": "44mm 18K Solid Rose Gold with Anti-Reflective Sapphire",
          "Dial": "Full Open-Worked Sapphire Dial with MHS Signature Bridge",
          "Strap": "Matte Alligator Leather with Quick-Release Mechanism",
          "Water Resistance": "30M / 3 ATM"
        }
      }
    ]
  },
  {
    id: "male-formal-wear",
    department: "Male",
    subCategory: "formal",
    navLabel: "Formal Suits",
    title: "Bespoke Italian Tuxedos",
    videoSrc: "Male/Male formal wear.mp4",
    timelineItems: [
      { start: 0.00, end: 0.20, id: "male-formal-01", title: "Midnight Navy 3-Piece Tuxedo", price: 549, tag: "Super 150s Merino Wool", image: "Male/Male formal wear details/midnight navy 3 piece detail.webp" },
      { start: 0.20, end: 0.40, id: "male-formal-02", title: "Charcoal Pinstripe Savile Row Suit", price: 595, tag: "Hand-Canvassed Wool", image: "Male/Male formal wear details/Charcoal pinstripe detail.webp" },
      { start: 0.40, end: 0.60, id: "male-formal-03", title: "Italian Cashmere Double-Breasted Blazer", price: 485, tag: "100% Mongolian Cashmere", image: "Male/Male formal wear details/italian cashmere double-breasted blazer.webp" },
      { start: 0.60, end: 0.80, id: "male-formal-04", title: "Three-Piece Tailored Winter Coat Suit", price: 525, tag: "Heavyweight Melange Wool & Satin Lapel", image: "Male/Male formal wear details/3 piece tailored winter coat suit.webp" },
      { start: 0.80, end: 1.00, id: "male-formal-05", title: "Extra-Button Structured Formal Coat", price: 475, tag: "Multi-Button Architectural Cut", image: "Male/Male formal wear details/extra button structured formal coat.webp" }
    ]
  },
  {
    id: "male-casual-wear",
    department: "Male",
    subCategory: "casual",
    navLabel: "Casual Wear",
    title: "Contemporary Casual & Street Luxe",
    videoSrc: "Male/Male Casual wear.mp4",
    startOffset: 0.5,
    endOffset: 0.5,
    timelineItems: [
      { start: 0.00, end: 0.25, id: "male-cas-01", title: "Heritage Cashmere Blend Overcoat", price: 345, tag: "Double-Faced Wool", image: "Male/Male Casual Details/heritage cashmere.webp" },
      { start: 0.25, end: 0.50, id: "male-cas-02", title: "Biker Lambskin Leather Jacket", price: 290, tag: "Full-Grain Italian Lambskin", image: "Male/Male Casual Details/biker lambskin leather.webp" },
      { start: 0.50, end: 0.75, id: "male-cas-03", title: "Mercerized Pima Cotton Polo Shirt", price: 92, tag: "Mother of Pearl Buttons", image: "Male/Male Casual Details/polo shirt.webp" },
      { start: 0.75, end: 1.00, id: "male-cas-04", title: "Japanese Selvedge Raw Denim Jeans", price: 199, tag: "14oz Kurabo Mill Denim", image: "Male/Male Casual Details/denim jeans.webp" }
    ]
  },
  {
    id: "male-footwear",
    department: "Male",
    subCategory: "footwear",
    navLabel: "Footwear",
    title: "Artisanal Handcrafted Shoes",
    videoSrc: "Male/male foot wear.mp4",
    endOffset: 0.8,
    timelineItems: [
      { start: 0.00, end: 0.20, id: "male-foot-01", title: "Venetian Burnished Oxford Shoes", price: 245, tag: "Italian Calfskin", image: "Male/male footwear details/oxford shoe.webp" },
      { start: 0.20, end: 0.40, id: "male-foot-02", title: "Goodyear Welted Brogues", price: 280, tag: "Oak Bark Tanned Sole", image: "Male/male footwear details/goodyear welted brogue.webp" },
      { start: 0.40, end: 0.60, id: "male-foot-03", title: "Chelsea Boot in Oiled Nubuck", price: 265, tag: "Waterproof Leather", image: "Male/male footwear details/chelsea boot in oiled.webp" },
      { start: 0.60, end: 0.84, id: "male-foot-04", title: "Monk Strap Calfskin Loafers", price: 235, tag: "Double Brass Buckle", image: "Male/male footwear details/monk strap calfskin.webp" },
      { start: 0.84, end: 1.00, id: "male-foot-05", title: "Minimalist Italian Leather Low-Tops", price: 185, tag: "Margom Rubber Outsole", image: "Male/male footwear details/minimalistic italian.webp" }
    ]
  },
  {
    id: "male-accessories",
    department: "Male",
    subCategory: "accessories",
    navLabel: "Accessories",
    title: "Curated Luxury Men's Accoutrements",
    videoSrc: "Male/male accessories.mp4",
    timelineItems: [
      { start: 0.00, end: 0.20, id: "male-acc-01", title: "Aviator Gold Titanium Sunglasses", price: 168, tag: "Polarized Anti-Glare Lens", image: "Male/Male accesorries detail/aviator gold titatanium sunglasses.webp" },
      { start: 0.20, end: 0.40, id: "male-acc-02", title: "Jacquard Woven Mulberry Silk Tie", price: 70, tag: "Hand-Stitched Italian Silk", image: "Male/Male accesorries detail/jacquard woven tie.webp" },
      { start: 0.40, end: 0.60, id: "male-acc-03", title: "Sterling Silver Onyx Cufflinks", price: 110, tag: "Hand-Set Obsidian Gemstone", image: "Male/Male accesorries detail/sterling silver onyx cufflinks.webp" },
      { start: 0.60, end: 0.80, id: "male-acc-04", title: "Embroidered Suede Baseball Cap", price: 56, tag: "Cashmere Suede & Brass Buckle", image: "Male/Male accesorries detail/cap.webp" },
      { start: 0.80, end: 1.00, id: "male-acc-05", title: "Oud Royale Extrait de Parfum", price: 192, tag: "Rare Agarwood & Smoked Amber", image: "Male/Male accesorries detail/perfume.webp" }
    ]
  },
  {
    id: "male-wed-wear",
    department: "Male",
    subCategory: "wedding",
    navLabel: "Wedding Wear",
    title: "Royal Wedding & Ceremonial Wear",
    videoSrc: "Male/male wed wear.mp4",
    timelineItems: [
      { start: 0.00, end: 0.20, id: "male-wed-01", title: "Imperial Raw Silk Wedding Sherwani", price: 499, tag: "Zardozi Antique Threadwork", image: "Male/Male wed details/Imperial Raw Silksherwani.webp" },
      { start: 0.20, end: 0.40, id: "male-wed-02", title: "Hand-Crafted Royal Velvet Embroidered Sherwani", price: 585, tag: "200+ Hours Hand-Embroidered Zari", image: "Male/Male wed details/hand crafted royal velvet embroided serwani.webp" },
      { start: 0.40, end: 0.60, id: "male-wed-03", title: "Light Festive Mehndi Kurta Set", price: 225, tag: "Mirror Work & Resham Embroidery", image: "Male/Male wed details/light festive mehndi kurta.webp" },
      { start: 0.40, end: 0.80, id: "male-wed-04", title: "Classic Banarasi Silk Kurta Shalwar", price: 150, tag: "Pure Chanderi Silk Weave", image: "Male/Male wed details/classic banarsi kurta shalwar.webp" },
      { start: 0.80, end: 1.00, id: "male-wed-05", title: "Embroidered Royal Jodhpuri Prince Coat", price: 440, tag: "Structured Tailoring & Metallic Brocade", image: "Male/Male wed details/prince coat.webp" }
    ]
  },

  // =========================================================================
  // FEMALE COLLECTION (6 SECTIONS)
  // =========================================================================
  {
    id: "female-wed-wear",
    department: "Female",
    subCategory: "wedding",
    navLabel: "Bridal Wear",
    title: "Royal Empress Bridal Lehengas",
    videoSrc: "Female/female wed wear.mp4",
    timelineItems: [
      { start: 0.00, end: 0.20, id: "fem-wed-01", title: "Royal Crimson Velvet Bridal Lehenga", price: 799, tag: "250+ Hours Zardozi Handcraft", image: "Female/female wed wear detail/1.webp" },
      { start: 0.20, end: 0.40, id: "fem-wed-02", title: "Gilded Zari Pure Tissue Silk Saree", price: 680, tag: "Resham & Swarovski Crystal Border", image: "Female/female wed wear detail/2.webp" },
      { start: 0.40, end: 0.60, id: "fem-wed-03", title: "Embellished Heavy Work Bridal Anarkali Frock", price: 570, tag: "Intricate Cutwork & Pearl Gota", image: "Female/female wed wear detail/3.webp" },
      { start: 0.60, end: 0.80, id: "fem-wed-04", title: "Embroidered Kurta, Dupatta & Frocky Shalwar Set", price: 465, tag: "Scalloped Organza & Hand Tassels", image: "Female/female wed wear detail/4.webp" },
      { start: 0.80, end: 1.00, id: "fem-wed-05", title: "Royal Long Chanderi Silk Suit with Gharara", price: 530, tag: "Flared Pleated Gharara & Zari Work", image: "Female/female wed wear detail/5.webp" }
    ]
  },
  {
    id: "female-traditional-wear",
    department: "Female",
    subCategory: "traditional",
    navLabel: "Traditional",
    title: "Heritage 3-Piece Festive Suits",
    videoSrc: "Female/female traditional wear.mp4",
    startOffset: 0.3,
    timelineItems: [
      { start: 0.00, end: 0.20, id: "fem-trad-01", title: "Heirloom Hand-Embroidered 3-Piece Suit", price: 325, tag: "Zardozi & Resham Threadwork", image: "Female/female traditional detail/1.webp" },
      { start: 0.20, end: 0.40, id: "fem-trad-02", title: "Pure Rawsilk Embroidered 3-Piece Suit", price: 385, tag: "Pure Chiffon Dupatta & Rawsilk Trouser", image: "Female/female traditional detail/2.webp" },
      { start: 0.40, end: 0.60, id: "fem-trad-03", title: "Festive Mirror Work Embroidered 3-Piece Suit", price: 275, tag: "Glistening Foil & Thread Detailing", image: "Female/female traditional detail/3.webp" },
      { start: 0.60, end: 0.80, id: "fem-trad-04", title: "Royal Micro-Velvet Luxury 3-Piece Suit", price: 435, tag: "Antique Gold Tilla & Zari Work", image: "Female/female traditional detail/4.webp" },
      { start: 0.80, end: 1.00, id: "fem-trad-05", title: "Digital Printed Luxury Lawn 3-Piece Suit", price: 165, tag: "Swiss Voile Dupatta & Embroidered Border", image: "Female/female traditional detail/5.webp" }
    ]
  },
  {
    id: "female-jewellery",
    department: "Female",
    subCategory: "jewellery",
    navLabel: "Jewellery",
    title: "Polki Diamond & Emerald High Jewellery",
    videoSrc: "Female/female jewellery.mp4",
    timelineItems: [
      { start: 0.00, end: 0.20, id: "fem-jewel-01", title: "Maharani Polki Diamond Choker Set", price: 620, tag: "22K Gold & Emeralds", image: "Female/female jewellery detail/1.webp" },
      { start: 0.20, end: 0.40, id: "fem-jewel-02", title: "Zambian Emerald Chandelier Jhumkas", price: 340, tag: "South Sea Pearls", image: "Female/female jewellery detail/2.webp" },
      { start: 0.40, end: 0.60, id: "fem-jewel-03", title: "Royal Kundan Pearl Bridal Hair Ring", price: 510, tag: "Handcrafted Bridal Hair Ornament", image: "Female/female jewellery detail/3.webp" },
      { start: 0.60, end: 0.80, id: "fem-jewel-04", title: "Royal Kundan Pearl Bridal Jhumar", price: 390, tag: "Hand-Strung Basra Pearls & Passa", image: "Female/female jewellery detail/4.webp" },
      { start: 0.80, end: 1.00, id: "fem-jewel-05", title: "Solitaire Emerald Cut Diamond Ring", price: 480, tag: "18K White Gold & VVS Diamond", image: "Female/female jewellery detail/5.webp" }
    ]
  },
  {
    id: "female-casual-wear",
    department: "Female",
    subCategory: "casual",
    navLabel: "Casual Wear",
    title: "Contemporary Chic Casual Collection",
    videoSrc: "Female/female casual wear.mp4",
    timelineItems: [
      { start: 0.00, end: 0.20, id: "fem-cas-01", title: "Camel Cashmere Tailored Long Coat", price: 330, tag: "Double-Faced Wool & Horn Buttons", image: "Female/female casual wear detail/1.webp" },
      { start: 0.20, end: 0.40, id: "fem-cas-02", title: "Crisp Poplin White Casual Button-Down Shirt", price: 95, tag: "100% Organic Pima Cotton", image: "Female/female casual wear detail/2.webp" },
      { start: 0.40, end: 0.60, id: "fem-cas-03", title: "Cropped Moto Lambskin Leather Jacket", price: 285, tag: "Full-Grain Italian Leather & Silver Hardware", image: "Female/female casual wear detail/3.webp" },
      { start: 0.60, end: 0.80, id: "fem-cas-04", title: "High-Rise Straight Leg Vintage Denim Jeans", price: 145, tag: "Premium Stretch Japanese Denim", image: "Female/female casual wear detail/4.webp" },
      { start: 0.80, end: 1.00, id: "fem-cas-05", title: "Sculpted Form-Fitting Ribbed Bodycon Maxi Dress", price: 195, tag: "Floor-Length Modal Stretch Silhouette", image: "Female/female casual wear detail/5.webp" }
    ]
  },
  {
    id: "female-footwear",
    department: "Female",
    subCategory: "footwear",
    navLabel: "Footwear",
    title: "Artisanal Heels & Designer Footwear",
    videoSrc: "Female/female footwear.mp4",
    timelineItems: [
      { start: 0.00, end: 0.20, id: "fem-foot-01", title: "Pointed-Toe Thin Stiletto High Heels", price: 260, tag: "105mm Italian Satin & Crystal Brooch", image: "Female/female footwear detail/1.webp" },
      { start: 0.20, end: 0.40, id: "fem-foot-02", title: "Classic Italian Lambskin Ballet Flats", price: 138, tag: "Cushioned Insole & Bow Accent", image: "Female/female footwear detail/2.webp" },
      { start: 0.40, end: 0.60, id: "fem-foot-03", title: "Horsebit Handcrafted Leather Loafers", price: 210, tag: "Polished Calfskin & Antique Brass Bit", image: "Female/female footwear detail/3.webp" },
      { start: 0.60, end: 0.80, id: "fem-foot-04", title: "Strappy Ankle-Buckle Mid-Heel Sandals", price: 205, tag: "Delicate Criss-Cross Straps & Suede Block Heel", image: "Female/female footwear detail/4.webp" },
      { start: 0.80, end: 1.00, id: "fem-foot-05", title: "Minimalist White Calfskin Leather Sneakers", price: 172, tag: "Margom Rubber Sole & Gold Foil Detailing", image: "Female/female footwear detail/5.webp" }
    ]
  },
  {
    id: "female-glasses",
    department: "Female",
    subCategory: "glasses",
    navLabel: "Glasses & Shades",
    title: "Designer Sunglasses & Frames",
    videoSrc: "Female/female glasses.mp4",
    timelineItems: [
      { start: 0.00, end: 0.20, id: "fem-glass-01", title: "Diva Cat-Eye Tortoiseshell Sunglasses", price: 155, tag: "UV400 Polarized Lenses", image: "Female/female glasses detail/1.webp" },
      { start: 0.20, end: 0.40, id: "fem-glass-02", title: "Gold-Rimmed Aviator Frames", price: 178, tag: "Mazzucchelli Bio-Acetate", image: "Female/female glasses detail/2.webp" },
      { start: 0.40, end: 0.60, id: "fem-glass-03", title: "Oversized Gradient Square Sunshades", price: 162, tag: "Shatterproof CR-39 Lenses", image: "Female/female glasses detail/3.webp" },
      { start: 0.60, end: 0.80, id: "fem-glass-04", title: "Titanium Rimless Hexagonal Glasses", price: 188, tag: "Ultra-Lightweight Beta Titanium", image: "Female/female glasses detail/4.webp" },
      { start: 0.80, end: 1.00, id: "fem-glass-05", title: "Midnight Black Butterfly Acetate Frames", price: 142, tag: "Glossy Piano Black Finish", image: "Female/female glasses detail/5.webp" }
    ]
  },

  // =========================================================================
  // KIDS COLLECTION (6 SECTIONS)
  // =========================================================================
  {
    id: "baby-footwear",
    department: "Kids",
    subCategory: "babyfootwear",
    navLabel: "Kids Shoes",
    title: "Artisanal Kids Shoes & Booties",
    videoSrc: "Kids/Baby kid footwear.mp4",
    timelineItems: [
      { start: 0.00, end: 0.20, id: "kid-babyfoot-01", title: "Baby Knitted Soft Shoes", price: 36, tag: "Hand-Knitted Merino Wool", image: "Kids/Baby kid footwear detail/1.webp" },
      { start: 0.20, end: 0.40, id: "kid-babyfoot-02", title: "Flat Girly Ballerina Shoes", price: 28, tag: "Soft Leather & Bow Detail", image: "Kids/Baby kid footwear detail/2.webp" },
      { start: 0.40, end: 0.60, id: "kid-babyfoot-03", title: "Boys Dual-Strap Grip Shoes", price: 34, tag: "Non-Slip Rubber Sole & Dual Velcro", image: "Kids/Baby kid footwear detail/3.webp" },
      { start: 0.60, end: 0.80, id: "kid-babyfoot-04", title: "Handcrafted Toddler Leather Loafers", price: 26, tag: "Supple Calfskin & Slip-On Ease", image: "Kids/Baby kid footwear detail/4.webp" },
      { start: 0.80, end: 1.00, id: "kid-babyfoot-05", title: "Girls Delicate Strappy Summer Sandals", price: 30, tag: "Breathable Open-Toe & Ankle Strap", image: "Kids/Baby kid footwear detail/5.webp" }
    ]
  },
  {
    id: "big-kids-formal",
    department: "Kids",
    subCategory: "kidsformal",
    navLabel: "Kids Wear",
    title: "Junior Prince Tuxedos & Galas",
    videoSrc: "Kids/Big Kids formal wear.mp4",
    startOffset: 0.5,
    timelineItems: [
      { start: 0.00, end: 0.24, id: "kid-formal-01", title: "Junior Gentleman Tailored Velvet Blazer", price: 115, tag: "Royal Navy Crushed Velvet & Satin Lapel", image: "Kids/Baby wear detail/1.webp" },
      { start: 0.24, end: 0.43, id: "kid-formal-02", title: "Twinkle Tulle Ballerina Princess Frock", price: 120, tag: "Multi-Layered Shimmer Tulle & Crystal Brooch", image: "Kids/Baby wear detail/2.webp" },
      { start: 0.43, end: 0.62, id: "kid-formal-03", title: "Cable-Knit Merino Wool Kids Sweater", price: 98, tag: "Pure Soft Merino Wool & Ribbed Cuffs", image: "Kids/Baby wear detail/3.webp" },
      { start: 0.62, end: 0.81, id: "kid-formal-04", title: "Elegant Striped Lining Formal Frock", price: 105, tag: "Soft Satin Lined Pleated Bodice", image: "Kids/Baby wear detail/4.webp" },
      { start: 0.81, end: 1.00, id: "kid-formal-05", title: "Kids Clean Calfskin Dress Sneakers", price: 82, tag: "Supple White Leather & Cushioned Sole", image: "Kids/Baby wear detail/5.webp" }
    ]
  },
  {
    id: "big-kids-shoes",
    department: "Kids",
    subCategory: "kidsshoes",
    navLabel: "Big Kids Shoes",
    title: "Premium Big Kids Shoes & Boots",
    videoSrc: "Kids/Big Kid Shoes.mp4",
    timelineItems: [
      { start: 0.00, end: 0.20, id: "kid-shoes-01", title: "Boys Classic Polished Oxford Dress Shoes", price: 64, tag: "Supple Full-Grain Leather & Cushioned Insole", image: "Kids/Big Kid Shoes detail/1.webp" },
      { start: 0.20, end: 0.40, id: "kid-shoes-02", title: "Kids Ankle-Length Chelsea Leather Boots", price: 72, tag: "Elastic Side Gusset & Anti-Slip Lug Sole", image: "Kids/Big Kid Shoes detail/2.webp" },
      { start: 0.40, end: 0.60, id: "kid-shoes-03", title: "StreetStyle Dynamic Big Kids Sneakers", price: 69, tag: "Breathable Knit Mesh & Air Cushion Heel", image: "Kids/Big Kid Shoes detail/3.webp" },
      { start: 0.60, end: 0.80, id: "kid-shoes-04", title: "Shiny Pink Patent Girl Ballerina Flats", price: 59, tag: "Glossy Patent Finish & Pearl Bow Accent", image: "Kids/Big Kid Shoes detail/4.webp" },
      { start: 0.80, end: 1.00, id: "kid-shoes-05", title: "Classic Piano Black Girl Ballerina Flats", price: 85, tag: "Smooth Matte Calfskin & Velvet Ribbon", image: "Kids/Big Kid Shoes detail/5.webp" }
    ]
  },
  {
    id: "kuchu-puchu-toys",
    department: "Kids",
    subCategory: "plushtoys",
    navLabel: "Kuchu Puchu Special",
    title: "Kuchu Puchu Plush & Sensory World",
    videoSrc: "Kids/Kuchu Puchu Kid toy section.mp4",
    startOffset: 0.6,
    timelineItems: [
      { start: 0.00, end: 0.20, id: "kid-toy-kp-01", title: "Kuchu Puchu Special by MHS", price: 0, tag: "80cm Micro-Plush & Velvet Bow", image: "Kids/kuchu puchu detail/1.webp" },
      { start: 0.20, end: 0.40, id: "kid-toy-kp-02", title: "Kuchu Puchu Special by MHS", price: 0, tag: "Soothing Rhythmic Sound & Soft Glow", image: "Kids/kuchu puchu detail/2.webp" },
      { start: 0.40, end: 0.60, id: "kid-toy-kp-03", title: "Kuchu Puchu Special by MHS", price: 0, tag: "Hypoallergenic Fluffy Sherpa & Shimmer Horn", image: "Kids/kuchu puchu detail/3.webp" },
      { start: 0.60, end: 0.80, id: "kid-toy-kp-04", title: "Kuchu Puchu Special by MHS", price: 0, tag: "Animated Flapping Ears & Nursery Rhymes", image: "Kids/kuchu puchu detail/4.webp" },
      { start: 0.80, end: 1.00, id: "kid-toy-kp-05", title: "Kuchu Puchu Special by MHS", price: 0, tag: "Weighted Calming Lavender Aromatherapy", image: "Kids/kuchu puchu detail/5.webp" }
    ]
  },
  {
    id: "boy-kid-toys",
    department: "Kids",
    subCategory: "boytoys",
    navLabel: "Boy Toys",
    title: "Action Figures & Robotic Supercars",
    videoSrc: "Kids/boy kid toys.mp4",
    timelineItems: [
      { start: 0.00, end: 0.20, id: "kid-toy-boy-01", title: "CyberMech Transforming Battle Titan", price: 78, tag: "Auto Transformation & Sounds", image: "Kids/boy kid toys detail/1.webp" },
      { start: 0.20, end: 0.40, id: "kid-toy-boy-02", title: "HyperDrift 2.4GHz 4WD RC Supercar", price: 62, tag: "360° Tumbling & Smoke Effect", image: "Kids/boy kid toys detail/2.webp" },
      { start: 0.40, end: 0.60, id: "kid-toy-boy-03", title: "Apex Stealth Combat Jet Fighter", price: 66, tag: "Retractable Landing Gear", image: "Kids/boy kid toys detail/3.webp" },
      { start: 0.60, end: 0.80, id: "kid-toy-boy-04", title: "Galactic Explorer Space Station HQ", price: 89, tag: "Sound & LED Launch Sequencer", image: "Kids/boy kid toys detail/4.webp" },
      { start: 0.80, end: 1.00, id: "kid-toy-boy-05", title: "DinoRaptor Robotic Walking Predator", price: 74, tag: "Touch-Activated Roar & Lights", image: "Kids/boy kid toys detail/5.webp" }
    ]
  },
  {
    id: "girl-kid-toys",
    department: "Kids",
    subCategory: "girltoys",
    navLabel: "Girl Toys",
    title: "Dollhouses & Creative Magic",
    videoSrc: "Kids/girl kid toys.mp4",
    startOffset: 0.4,
    timelineItems: [
      { start: 0.00, end: 0.25, id: "kid-toy-girl-01", title: "Grand Castle Princess Dreamhouse", price: 125, tag: "3-Story Wooden Castle", image: "Kids/girl kid toys detail/1.webp" },
      { start: 0.25, end: 0.44, id: "kid-toy-girl-02", title: "Glow Magic Fashion Runway Studio", price: 58, tag: "Glitter Fabrics & Mannequin", image: "Kids/girl kid toys detail/2.webp" },
      { start: 0.44, end: 0.63, id: "kid-toy-girl-03", title: "Sparkle Boutique Makeup & Beauty Case", price: 68, tag: "Pretend Cosmetics & Gem Box", image: "Kids/girl kid toys detail/3.webp" },
      { start: 0.63, end: 0.82, id: "kid-toy-girl-04", title: "Princess Enchanted Magic Vanity Mirror", price: 48, tag: "Illuminated Ornate Gold Mirror", image: "Kids/girl kid toys detail/4.webp" },
      { start: 0.82, end: 1.00, id: "kid-toy-girl-05", title: "Royal Afternoon Toyish Tea Set", price: 54, tag: "Porcelain Teacups & Pastry Tier", image: "Kids/girl kid toys detail/5.webp" }
    ]
  }
];

// Flatten all items for global product lookups and runtime uniqueness validation
export const PRODUCTS = [];
const seenTitles = new Set();
const seenPrices = new Set();

CATALOG.forEach(c => {
  if (c.timelineItems) {
    c.timelineItems.forEach(item => {
      if (seenTitles.has(item.title) && item.title !== 'Kuchu Puchu Special by MHS') {
        console.warn(`[MHS STORE Catalog Warning] Duplicate product title detected: "${item.title}"`);
      }
      if (seenPrices.has(item.price)) {
        console.warn(`[MHS STORE Catalog Warning] Duplicate product price detected: $${item.price} for "${item.title}"`);
      }
      seenTitles.add(item.title);
      seenPrices.add(item.price);

      PRODUCTS.push({
        ...item,
        department: c.department,
        videoRefId: c.id
      });
    });
  }
});
