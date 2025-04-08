// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PeerVerse is ReentrancyGuard, Ownable {
    struct Skill {
        address teacher;
        string title;
        string description;
        uint256 price;
        uint256 duration; // in minutes
        bool isActive;
        uint256 rating;
        uint256 totalRatings;
    }

    struct Session {
        address student;
        address teacher;
        uint256 skillId;
        uint256 startTime;
        uint256 endTime;
        bool isCompleted;
        bool isPaid;
    }

    mapping(uint256 => Skill) public skills;
    mapping(uint256 => Session) public sessions;
    mapping(address => uint256[]) public teacherSkills;
    mapping(address => uint256[]) public studentSessions;

    uint256 public skillCount;
    uint256 public sessionCount;
    uint256 public platformFee; // in basis points (1% = 100)

    event SkillListed(uint256 indexed skillId, address indexed teacher, string title);
    event SessionCreated(uint256 indexed sessionId, address indexed student, address indexed teacher, uint256 skillId);
    event SessionCompleted(uint256 indexed sessionId);
    event RatingSubmitted(uint256 indexed skillId, uint256 rating);

    constructor(uint256 _platformFee) {
        _transferOwnership(msg.sender);
        platformFee = _platformFee;
    }

    function listSkill(
        string memory _title,
        string memory _description,
        uint256 _price,
        uint256 _duration
    ) external {
        uint256 skillId = skillCount++;
        skills[skillId] = Skill({
            teacher: msg.sender,
            title: _title,
            description: _description,
            price: _price,
            duration: _duration,
            isActive: true,
            rating: 0,
            totalRatings: 0
        });

        teacherSkills[msg.sender].push(skillId);
        emit SkillListed(skillId, msg.sender, _title);
    }

    function bookSession(uint256 _skillId) external payable nonReentrant {
        Skill storage skill = skills[_skillId];
        require(skill.isActive, "Skill is not active");
        require(msg.value >= skill.price, "Insufficient payment");

        uint256 sessionId = sessionCount++;
        sessions[sessionId] = Session({
            student: msg.sender,
            teacher: skill.teacher,
            skillId: _skillId,
            startTime: block.timestamp,
            endTime: 0,
            isCompleted: false,
            isPaid: false
        });

        studentSessions[msg.sender].push(sessionId);
        emit SessionCreated(sessionId, msg.sender, skill.teacher, _skillId);
    }

    function completeSession(uint256 _sessionId) external nonReentrant {
        Session storage session = sessions[_sessionId];
        require(msg.sender == session.teacher, "Only teacher can complete session");
        require(!session.isCompleted, "Session already completed");

        session.isCompleted = true;
        session.endTime = block.timestamp;

        uint256 platformFeeAmount = (skills[session.skillId].price * platformFee) / 10000;
        uint256 teacherAmount = skills[session.skillId].price - platformFeeAmount;

        (bool success, ) = session.teacher.call{value: teacherAmount}("");
        require(success, "Transfer failed");

        emit SessionCompleted(_sessionId);
    }

    function rateSkill(uint256 _skillId, uint256 _rating) external {
        require(_rating > 0 && _rating <= 5, "Invalid rating");
        Skill storage skill = skills[_skillId];
        
        // Update rating
        uint256 currentTotal = skill.rating * skill.totalRatings;
        skill.totalRatings++;
        skill.rating = (currentTotal + _rating) / skill.totalRatings;

        emit RatingSubmitted(_skillId, _rating);
    }

    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = _newFee;
    }

    function withdrawPlatformFees() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    function getTeacherSkills(address _teacher) external view returns (uint256[] memory) {
        return teacherSkills[_teacher];
    }

    function getStudentSessions(address _student) external view returns (uint256[] memory) {
        return studentSessions[_student];
    }
} 