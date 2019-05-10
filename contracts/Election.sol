pragma solidity ^0.5.0;

contract Election {
    // candidate model
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
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
}