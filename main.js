const fs = require("fs");
const readline = require("readline");

// const INPUT = "psc-snapshot-2021-03-24_1of18.txt";
const INPUT = "persons-with-significant-control-snapshot-2021-03-24.txt";
const NATIONALITY = "Pakistani";

let broken_record = 0;
const today = new Date();
const TIME = String(today.getTime());

let json_status = checkJsonAlreadyCreated();
if (json_status) {
  deleteAlreadyCreatedFile();
}

const rl = readline.createInterface({
  input: fs.createReadStream(INPUT),
  output: process.stdout,
  terminal: false,
});

rl.on("line", (line) => {
  let copy = JSON.parse(line);
  let status = queryParametersControlAndDob(copy);
  const data = JSON.stringify(copy);
  if (status) {
    let filename = `${TIME}__${NATIONALITY}.txt`;
    writeToFile(filename, data);
  }
});

function queryParametersControlAndDob(copy) {
  let control_array = copy.data.natures_of_control;
  if (control_array === undefined) {
    return;
  }
  let with_control = control_array.filter(
    (e) => e === "ownership-of-shares-75-to-100-percent"
  );
  if (with_control.length != 0) {
    if (copy.data.date_of_birth != undefined && copy.data.date_of_birth.year < 1961) {
      if (copy.data.nationality === NATIONALITY) {
        console.log(copy.data);
        console.log('\n');
        return true;
      }
    }
    else if (copy.data.date_of_birth === undefined) {
      broken_record++;
    }
  }
  return false;
}

function writeToFile(filename, data) {
  try {
    let total = data + "\n";
    fs.appendFileSync(filename, total);
    console.log(`Record saved to ${filename}.`);
  } catch (error) {
    console.log(error);
  }
}

function checkJsonAlreadyCreated() {
  try {
    return fs.existsSync("persons_with_correct_control_and_dob.txt")
      ? true
      : false;
  } catch (err) {
    console.error(err);
  }
}

function deleteAlreadyCreatedFile() {
  try {
    fs.unlinkSync("persons_with_correct_control_and_dob.txt");
  } catch (error) {
    console.log(error);
  }
}
