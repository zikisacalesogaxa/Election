pragma solidity ^0.5.0;

contract Election {
    // candidate model
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    event votedEvent (
        uint indexed _candidateId
    );

    // accounts that have voted
    mapping(address => bool) public voters;
    // read/write candidates
    mapping(uint => Candidate) public candidates;

    // store candidates count
    uint public candidatesCount;

    // constructor
    constructor () public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    // add candidate function
    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote (uint _candidateId) public {
        // address has never voted
        require(!voters[msg.sender], "already voted!");

        // validate voter
        require(_candidateId > 0 && _candidateId <= candidatesCount, "voter does not exist");

        // record voter has voted
        voters[msg.sender] = true;

        // update candidate vote count
        candidates[_candidateId].voteCount ++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }
}
