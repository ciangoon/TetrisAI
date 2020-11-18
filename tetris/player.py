from board import *
from random import Random
import math

class Player:
    def __init__(self,seed=None):
        self.random = Random(seed)
        self.best_position = 0
        self.best_rotation = 0
        self.total_score = 0

        #Weighting
        # self.holes_weight = -0.35663
        # self.smoothness_weight = -0.184483
        # self.complete_lines_weight = 0.76066
        # self.aggregateHeight_weight = -0.510066

        # self.holes_weight = -0.401
        # self.smoothness_weight = -0.100
        # self.complete_lines_weight = 0.5
        # self.aggregateHeight_weight = -0.400
        self.holes_weight = -0.40000001
        self.smoothness_weight = -0.100000000
        self.complete_lines_weight = 0.5
        self.aggregateHeight_weight = -0.400000000
        
    def calculate_aggregate_height(self,board):
        #Sum of the height of each column defined as the distance from
        #the top tile to the bottom tile
        column_height = []
        for column in range(board.width):
            for row in range(board.height):
            #Append to height for each row and column that is filled with a block
                if (column,row) in board.cells:
                    column_height.append(board.height-row)
                    break
                #Edge case
                elif row == board.height - 1 and (row,column) not in board.cells:
                    column_height.append(0)
        return column_height

    def calculate_smoothness(self,height,board):
        #Smoothness is defined by the absolute difference in the heights of 
        #adjacent columns
        smoothness = 0 
        # Iterate through all columns 
        for i in range(0,board.width-1):
            smoothness += abs(height[i] - height[i+1])
        return smoothness
    
    def calculate_complete_lines (self,board):
        #calculate complete lines on the board 
        complete_lines=0
        # for column in range(board.height):
        #     if (board.line_full(column)):
        #         complete_lines +=1
        for row in range(board.height):
            check = True
            for column in range(board.width):
                # Checks if any tile is empty, if so, the line is not complete, break out of loop
                if (row, column) not in board.cells:
                    check = False
                    break
            if check == True:
                complete_lines += 1
        if complete_lines < 0:
            complete_lines = 0
        return complete_lines

    def calculate_holes (self,board):
        # calculates the number of holes, defined as an empty space
        # such that at least one tile in the same column is above it on the board
        holes = 0

        for row in range(board.height):
            for column in range(board.width):
                # Check if for a certain row and column, tile is filled ( != 0 ), but its tile above
                # (row + 1 , column) is empty ( ==0 )
                if(row,column) not in board.cells and (row - 1,column) in board.cells:
                    holes+=1
        return holes

    def find_best_move(self,board):
        best_score = -math.inf
        #Only possible to place blocks in 10 different positions
        for position in range(0,board.width):
            #Only 3 types of possible rotations
            for rotation in range(0,4):
                # Cloning the board for each iteration
                sandbox = board.clone()
                # Moves block in cloned board to its resepctive rotation and position
                # to calculate its score
                for i in range(0,rotation):
                    if sandbox.rotate(Rotation.Clockwise) is True:
                        break;
                if position == 0:
                    for i in range(0,5):
                        if sandbox.move(Direction.Left) is True:
                            break;
                elif position == 1:
                    for i in range(0,4):
                        if sandbox.move(Direction.Left) is True:
                            break;
                elif position == 2:
                    for i in range(0,3):
                        if sandbox.move(Direction.Left) is True:
                            break;
                elif position == 3:
                    for i in range(0,2):
                        if sandbox.move(Direction.Left) is True:
                            break;
                elif position ==4:
                    if sandbox.move(Direction.Left) is True:
                            break;
                elif position ==6:
                    if sandbox.move(Direction.Right) is True:
                            break;
                elif position ==7:
                    for i in range(0,2):
                        if sandbox.move(Direction.Right) is True:
                            break;
                elif position ==8:
                    for i in range(0,3):
                        if sandbox.move(Direction.Right) is True:
                            break;
                elif position ==9:
                    for i in range(0,4):
                        if sandbox.move(Direction.Right) is True:
                            break;
                else:
                    pass

                try:
                    sandbox.move(Direction.Drop)
                except NoBlockException:
                    pass
                
                #Assigns variables to the return value of its function
                #Height
                height = self.calculate_aggregate_height(sandbox)
                total_height = sum(height)
                #Smoothness
                smoothness = self.calculate_smoothness(height,board)
                #Completed Lines
                completeLines = self.calculate_complete_lines(sandbox)
                #Holes
                holes = self.calculate_holes(sandbox)
                #Now, combine scores multiplied by its respective weighting
                total_height_score = total_height * self.aggregateHeight_weight
                smoothness_score = smoothness * self.smoothness_weight
                completeLines_score = completeLines * self.complete_lines_weight
                holes_score = holes * self.holes_weight

                #Then, collate all scores
                self.total_score = total_height_score + smoothness_score + completeLines_score + holes_score
               
                #Update best score each time
                if self.total_score >= best_score:
                    best_score = self.total_score
                    self.best_position = position
                    self.best_rotation = rotation 

        return (self.best_position,self.best_rotation)

    def do_move(self,board,best_position,best_rotation):
            do_move = []
            for i in range(0,best_rotation):
                do_move.append(Rotation.Clockwise)
            if best_position == 0:
                for i in range(0,5):
                    do_move.append(Direction.Left)
            elif best_position == 1:
                for i in range(0,4):
                    do_move.append(Direction.Left)
            elif best_position == 2:
                for i in range(0,3):
                    do_move.append(Direction.Left)
            elif best_position == 3:
                for i in range(0,2):
                    do_move.append(Direction.Left)
            elif best_position == 4:
                do_move.append(Direction.Left)
            elif best_position ==6:
                do_move.append(Direction.Right)
            elif best_position ==7:
                for i in range(0,2):
                    do_move.append(Direction.Right)
            elif best_position ==8:
                for i in range(0,3):
                    do_move.append(Direction.Right)
            elif best_position == 9:
                for i in range(0,4):
                    do_move.append(Direction.Right)
            else:
                pass
            do_move.append(Direction.Drop)
            return do_move

    def choose_action(self, board):
        self.find_best_move(board)
        #Executes the best move 
        return self.do_move(board,self.best_position,self.best_rotation)

class RandomPlayer(Player):
    def __init__(self, seed=None):
        self.random = Random(seed)

    def choose_action(self, board):
        return self.random.choice([
            Direction.Left,
            Direction.Right,
            Direction.Down,
            Rotation.Anticlockwise,
            Rotation.Clockwise,
        ])


SelectedPlayer = Player
