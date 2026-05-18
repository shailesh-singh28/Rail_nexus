/**
 * Seed script — populates the database with initial data
 * Run: node scripts/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const mongoose = require('mongoose');

const Division = require('../models/Division');
const MajorSection = require('../models/MajorSection');
const Section = require('../models/Section');
const MainCategory = require('../models/MainCategory');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const TestType = require('../models/TestType');
const Parameter = require('../models/Parameter');
const FormSchema = require('../models/FormSchema');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/railnexus');
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    Division.deleteMany({}),
    MajorSection.deleteMany({}),
    Section.deleteMany({}),
    MainCategory.deleteMany({}),
    Category.deleteMany({}),
    SubCategory.deleteMany({}),
    TestType.deleteMany({}),
    Parameter.deleteMany({}),
    FormSchema.deleteMany({}),
    User.deleteMany({})
  ]);
  console.log('🗑️  Cleared existing data');

  // ── Divisions ─────────────────────────────────────────
  const [bilaspur, raipur, nagpur] = await Division.insertMany([
    { name: 'Bilaspur', code: 'BSP' },
    { name: 'Raipur', code: 'R' },
    { name: 'Nagpur', code: 'NGP' }
  ]);
  console.log('✅ Divisions seeded');

  // ── Major Sections ────────────────────────────────────
  const [ms1, ms2, ms3, ms4, ms5] = await MajorSection.insertMany([
    { name: '(RIG-JSG) RAIGARH-JHARSUGUDA', division: bilaspur._id },
    { name: '(CHAMP-RIG) CHAMPA-RAIGARH', division: bilaspur._id },
    { name: '(BSP-USL) BILASPUR-USLAPUR', division: bilaspur._id },
    { name: '(R-BSP) RAIPUR-BILASPUR', division: raipur._id },
    { name: '(NGP-WR) NAGPUR-WARDHA', division: nagpur._id }
  ]);
  console.log('✅ Major sections seeded');

  // ── Sections ──────────────────────────────────────────
  await Section.insertMany([
    { name: 'DAO-HGR', majorSection: ms1._id },
    { name: 'KRL-JMG', majorSection: ms1._id },
    { name: 'RIG-JSG', majorSection: ms1._id },
    { name: 'CHAMP-KRL', majorSection: ms2._id },
    { name: 'KRL-RIG', majorSection: ms2._id },
    { name: 'BSP-USL', majorSection: ms3._id },
    { name: 'USL-KRBA', majorSection: ms3._id },
    { name: 'R-TILD', majorSection: ms4._id },
    { name: 'TILD-BSP', majorSection: ms4._id },
    { name: 'NGP-WR', majorSection: ms5._id },
    { name: 'WR-SEG', majorSection: ms5._id }
  ]);
  console.log('✅ Sections seeded');

  // ── Main Categories ───────────────────────────────────
  const [telecom, signaling, power] = await MainCategory.insertMany([
    { name: 'Telecom Gear', description: 'Telecommunication equipment and cables' },
    { name: 'Signaling Gear', description: 'Railway signaling equipment' },
    { name: 'Power Supply Gear', description: 'Power supply and battery systems' }
  ]);
  console.log('✅ Main categories seeded');

  // ── Categories ────────────────────────────────────────
  const [cable, radio, exchange, otherTelecom, signals, pointMachines, ips, battery] =
    await Category.insertMany([
      { name: 'Cable', mainCategory: telecom._id },
      { name: 'Radio', mainCategory: telecom._id },
      { name: 'Exchange', mainCategory: telecom._id },
      { name: 'Other', mainCategory: telecom._id },
      { name: 'Signals', mainCategory: signaling._id },
      { name: 'Point Machines', mainCategory: signaling._id },
      { name: 'IPS', mainCategory: power._id },
      { name: 'Battery', mainCategory: power._id }
    ]);
  console.log('✅ Categories seeded');

  // ── Sub Categories ────────────────────────────────────
  const [sixQuard, otherCable, ofc, vhf, microwave, colorLight, ledSignal, singleSlide, multiSlide, ipsUnit, vrla, liIon] =
    await SubCategory.insertMany([
      { name: '6 Quad', category: cable._id },
      { name: 'Other', category: cable._id },
      { name: 'OFC', category: cable._id },
      { name: 'VHF Set', category: radio._id },
      { name: 'Microwave Link', category: radio._id },
      { name: 'Colour Light Signal', category: signals._id },
      { name: 'LED Signal', category: signals._id },
      { name: 'Single Slide', category: pointMachines._id },
      { name: 'Multi Slide', category: pointMachines._id },
      { name: 'IPS Unit', category: ips._id },
      { name: 'VRLA Battery', category: battery._id },
      { name: 'Li-Ion Battery', category: battery._id }
    ]);
  console.log('✅ Sub-categories seeded');

  // ── Test Types ────────────────────────────────────────
  const [testing, joint, earthing, otdrTest, powerTest, voltageTest, capacityTest] =
    await TestType.insertMany([
      { name: 'Testing', subCategory: sixQuard._id },
      { name: 'Joint', subCategory: sixQuard._id },
      { name: 'Earthing', subCategory: sixQuard._id },
      { name: 'OTDR Test', subCategory: ofc._id },
      { name: 'Power Test', subCategory: vhf._id },
      { name: 'Voltage Test', subCategory: ipsUnit._id },
      { name: 'Capacity Test', subCategory: vrla._id }
    ]);
  console.log('✅ Test types seeded');

  // ── Parameters ────────────────────────────────────────
  const [loopRes, meggering, tms, nextFext, jointRes, earthVal, otdrLoss, txPower, outputVoltage, battCapacity] =
    await Parameter.insertMany([
      { name: 'Loop Resistance', testType: testing._id },
      { name: 'Meggering', testType: testing._id },
      { name: 'TMS', testType: testing._id },
      { name: 'NEXT-FEXT', testType: testing._id },
      { name: 'Joint Resistance', testType: joint._id },
      { name: 'Earth Value', testType: earthing._id },
      { name: 'OTDR Loss', testType: otdrTest._id },
      { name: 'TX Power', testType: powerTest._id },
      { name: 'Output Voltage', testType: voltageTest._id },
      { name: 'Battery Capacity', testType: capacityTest._id }
    ]);
  console.log('✅ Parameters seeded');

  // ── Form Schemas ──────────────────────────────────────
  await FormSchema.insertMany([
    {
      parameter: loopRes._id,
      fields: [
        { label: 'Loop Value', type: 'number', required: true, unit: 'Ω' },
        { label: 'Tolerance', type: 'number', required: true, unit: 'Ω' },
        { label: 'Test Status', type: 'select', options: ['Pass', 'Fail'], required: true },
        { label: 'Remarks', type: 'text', required: false }
      ]
    },
    {
      parameter: meggering._id,
      fields: [
        { label: 'Applied Voltage', type: 'number', required: true, unit: 'V' },
        { label: 'Resistance', type: 'number', required: true, unit: 'MΩ' },
        { label: 'Insulation Quality', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'], required: true },
        { label: 'Remarks', type: 'text', required: false }
      ]
    },
    {
      parameter: tms._id,
      fields: [
        { label: 'Signal Level', type: 'number', required: true, unit: 'dBm' },
        { label: 'Error Rate', type: 'number', required: true, unit: '%' },
        { label: 'Status', type: 'select', options: ['Active', 'Inactive'], required: true }
      ]
    },
    {
      parameter: nextFext._id,
      fields: [
        { label: 'NEXT Value', type: 'number', required: true, unit: 'dB' },
        { label: 'FEXT Value', type: 'number', required: true, unit: 'dB' },
        { label: 'Frequency', type: 'number', required: true, unit: 'MHz' },
        { label: 'Result', type: 'select', options: ['Compliant', 'Non-Compliant'], required: true }
      ]
    },
    {
      parameter: jointRes._id,
      fields: [
        { label: 'Resistance', type: 'number', required: true, unit: 'Ω' },
        { label: 'Condition', type: 'select', options: ['Good', 'Weak', 'Broken'], required: true }
      ]
    },
    {
      parameter: earthVal._id,
      fields: [
        { label: 'Earth Resistance', type: 'number', required: true, unit: 'Ω' },
        { label: 'Soil Condition', type: 'text', required: true }
      ]
    },
    {
      parameter: otdrLoss._id,
      fields: [
        { label: 'Total Loss', type: 'number', required: true, unit: 'dB' },
        { label: 'Splice Loss', type: 'number', required: true, unit: 'dB' },
        { label: 'Fiber Length', type: 'number', required: true, unit: 'km' },
        { label: 'Result', type: 'select', options: ['Pass', 'Fail'], required: true }
      ]
    },
    {
      parameter: txPower._id,
      fields: [
        { label: 'TX Power', type: 'number', required: true, unit: 'dBm' },
        { label: 'RX Power', type: 'number', required: true, unit: 'dBm' },
        { label: 'VSWR', type: 'number', required: false },
        { label: 'Status', type: 'select', options: ['Normal', 'Degraded', 'Faulty'], required: true }
      ]
    },
    {
      parameter: outputVoltage._id,
      fields: [
        { label: 'Output Voltage', type: 'number', required: true, unit: 'V' },
        { label: 'Load Current', type: 'number', required: true, unit: 'A' },
        { label: 'Status', type: 'select', options: ['Normal', 'Low', 'High', 'Faulty'], required: true },
        { label: 'Remarks', type: 'text', required: false }
      ]
    },
    {
      parameter: battCapacity._id,
      fields: [
        { label: 'Capacity', type: 'number', required: true, unit: 'Ah' },
        { label: 'Terminal Voltage', type: 'number', required: true, unit: 'V' },
        { label: 'Internal Resistance', type: 'number', required: false, unit: 'mΩ' },
        { label: 'Condition', type: 'select', options: ['Good', 'Degraded', 'Replace'], required: true }
      ]
    }
  ]);
  console.log('✅ Form schemas seeded');

  // ── Admin User ────────────────────────────────────────
  await User.create({
    name: 'Admin User',
    email: 'admin@railnexus.in',
    phone: '8127918849',
    password: 'Admin@1234',
    role: 'admin',
    division: bilaspur._id
  });

  await User.create({
    name: 'Test Engineer',
    email: 'engineer@railnexus.in',
    phone: '9876543211',
    password: 'Engineer@1234',
    role: 'engineer',
    division: bilaspur._id
  });

  console.log('✅ Users seeded');
  console.log('\n🎉 Seed complete!');
  console.log('   Admin:    admin@railnexus.in    / Admin@1234 / Phone: 8127918849');
  console.log('   Engineer: engineer@railnexus.in / Engineer@1234 / Phone: 9876543211');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
