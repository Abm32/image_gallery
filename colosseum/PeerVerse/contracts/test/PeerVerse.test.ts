import { expect } from "chai";
import { ethers } from "hardhat";
import { PeerVerse } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PeerVerse", function () {
  let peerVerse: PeerVerse;
  let owner: SignerWithAddress;
  let teacher: SignerWithAddress;
  let student: SignerWithAddress;
  const PLATFORM_FEE = 200; // 2%

  beforeEach(async function () {
    [owner, teacher, student] = await ethers.getSigners();
    const PeerVerse = await ethers.getContractFactory("PeerVerse");
    peerVerse = await PeerVerse.deploy(PLATFORM_FEE);
  });

  describe("Skill Listing", function () {
    it("Should allow teachers to list skills", async function () {
      await peerVerse.connect(teacher).listSkill(
        "Web Development",
        "Learn to build modern web applications",
        ethers.parseEther("0.1"),
        60
      );

      const skill = await peerVerse.skills(0);
      expect(skill.teacher).to.equal(teacher.address);
      expect(skill.title).to.equal("Web Development");
      expect(skill.price).to.equal(ethers.parseEther("0.1"));
    });

    it("Should track teacher's skills", async function () {
      await peerVerse.connect(teacher).listSkill(
        "Web Development",
        "Learn to build modern web applications",
        ethers.parseEther("0.1"),
        60
      );

      const teacherSkills = await peerVerse.getTeacherSkills(teacher.address);
      expect(teacherSkills.length).to.equal(1);
      expect(teacherSkills[0]).to.equal(0);
    });
  });

  describe("Session Booking", function () {
    beforeEach(async function () {
      await peerVerse.connect(teacher).listSkill(
        "Web Development",
        "Learn to build modern web applications",
        ethers.parseEther("0.1"),
        60
      );
    });

    it("Should allow students to book sessions", async function () {
      await peerVerse.connect(student).bookSession(0, {
        value: ethers.parseEther("0.1"),
      });

      const session = await peerVerse.sessions(0);
      expect(session.student).to.equal(student.address);
      expect(session.teacher).to.equal(teacher.address);
      expect(session.skillId).to.equal(0);
    });

    it("Should track student's sessions", async function () {
      await peerVerse.connect(student).bookSession(0, {
        value: ethers.parseEther("0.1"),
      });

      const studentSessions = await peerVerse.getStudentSessions(student.address);
      expect(studentSessions.length).to.equal(1);
      expect(studentSessions[0]).to.equal(0);
    });
  });

  describe("Session Completion", function () {
    beforeEach(async function () {
      await peerVerse.connect(teacher).listSkill(
        "Web Development",
        "Learn to build modern web applications",
        ethers.parseEther("0.1"),
        60
      );
      await peerVerse.connect(student).bookSession(0, {
        value: ethers.parseEther("0.1"),
      });
    });

    it("Should allow teachers to complete sessions", async function () {
      await peerVerse.connect(teacher).completeSession(0);

      const session = await peerVerse.sessions(0);
      expect(session.isCompleted).to.be.true;
    });

    it("Should distribute funds correctly", async function () {
      const initialTeacherBalance = await ethers.provider.getBalance(teacher.address);
      await peerVerse.connect(teacher).completeSession(0);

      const finalTeacherBalance = await ethers.provider.getBalance(teacher.address);
      const expectedEarnings = ethers.parseEther("0.098"); // 0.1 - 2% fee
      expect(finalTeacherBalance - initialTeacherBalance).to.be.closeTo(
        expectedEarnings,
        ethers.parseEther("0.001")
      );
    });
  });

  describe("Rating System", function () {
    beforeEach(async function () {
      await peerVerse.connect(teacher).listSkill(
        "Web Development",
        "Learn to build modern web applications",
        ethers.parseEther("0.1"),
        60
      );
    });

    it("Should allow rating skills", async function () {
      await peerVerse.connect(student).rateSkill(0, 5);
      const skill = await peerVerse.skills(0);
      expect(skill.rating).to.equal(5);
      expect(skill.totalRatings).to.equal(1);
    });

    it("Should calculate average rating correctly", async function () {
      await peerVerse.connect(student).rateSkill(0, 5);
      await peerVerse.connect(owner).rateSkill(0, 3);
      
      const skill = await peerVerse.skills(0);
      expect(skill.rating).to.equal(4); // (5 + 3) / 2
      expect(skill.totalRatings).to.equal(2);
    });
  });
}); 