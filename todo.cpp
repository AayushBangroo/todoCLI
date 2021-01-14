//Developed by: Aayush Bangroo
#include<iostream>
#include<time.h>
#include<filesystem>
#include<fstream>
#include<string>
#include<vector>
#include<map>
using namespace std;

void init(){//initializer
  //reset the files
  ofstream resetCountFile("count.txt", ofstream::trunc);
  ofstream resetItemFile("data.txt", ofstream::trunc);
  ofstream resetCompletedFile("completed.txt", ofstream::trunc);
  resetCountFile<<1<<endl;
  resetCompletedFile<<0<<endl;
  
  resetCompletedFile.close();
  resetCountFile.close();
  resetItemFile.close();
}

const string currentDateTime() {
    time_t     now = time(0);
    struct tm  tstruct;
    char       buf[80];
    tstruct = *localtime(&now);

    strftime(buf, sizeof(buf), "%Y-%m-%d", &tstruct);

    return buf;
}

bool checkValid(ifstream&itemFile, char id){
	string line;
	bool valid=false;
	
	while(getline(itemFile, line)){
		if(line[0]==id){
			valid=true;
		}
	}
	
	if(!valid) return false;
	return true;
}

void help(){
	
	cout<<"Usage :-"<<endl;
    cout<<"$ ./todo add \"todo item\"  # Add a new todo"<<endl;
    cout<<"$ ./todo ls               # Show remaining todos"<<endl;
    cout<<"$ ./todo del NUMBER       # Delete a todo"<<endl;
    cout<<"$ ./todo done NUMBER      # Complete a todo"<<endl;
    cout<<"$ ./todo help             # Show usage"<<endl;
    cout<<"$ ./todo report           # Statistics"<<endl;
}

bool isEmpty(ifstream&itemFile)
{
    return itemFile.peek() == ifstream::traits_type::eof();
}

void addItem(string item){
  fstream countFile;
  ofstream outItemFile;
 
 
  countFile.open("count.txt");
  //get id for item from countFile
  string id;
  getline(countFile, id);
  
  outItemFile.open("data.txt", ios_base::app); // append the item instead of overwrite
  outItemFile<<id<<item<<endl;//append item with id
  //increment the count in countFile
  string newCount = to_string(stoi(id)+1);
  
  ofstream overwrite("count.txt", ofstream::trunc);
  overwrite<<newCount<<endl;//overwrite newCount in CountFile
  outItemFile.close();
  countFile.close();
  overwrite.close();
  //show message to user
  cout<<"Added todo: "<<"\""<<item<<"\""<<endl;
}

void showItems(){// Show ALL TODO Items In reverse Order
  string line;
  vector<string> reverseItems;
  ifstream myfile ("data.txt");
  if (myfile.is_open() && !isEmpty(myfile))
  {
    while ( getline (myfile,line) ){
		reverseItems.push_back(line.substr(1,line.length()));
    }
    myfile.close();
    
    for(int i=reverseItems.size()-1; i>=0; i--){// -1 to avoid displaying empty new line
		cout <<"["<<(i+1)<<"] "<<reverseItems[i]<< '\n';
	}
  }

  else cout << "There are no pending todos!"<<endl;
}

void deleteItem(char id, bool showMessage=true){//delete TODO item by ID
	ifstream itemFile("data.txt");
	bool deleted=false;
	//check is list is empty
	if(isEmpty(itemFile)){
		cout<<"TODO List is empty"<<endl;
		itemFile.close();
		return;
	}
	ifstream countFile("count.txt");
	ofstream temp;
	temp.open("temp.txt");//create a temp file for transferring items after deletion
	
	string line;
	while (getline(itemFile, line)){
		if(line[0]!=id){//copy all items except the one to be deleted
			if(line[0] > id){//reduce the id by 1 if its id is greater than the id of item deleted
				line[0] = char(line[0]-1);
				temp<<line<<endl;
			}
			else{
				temp<<line<<endl;
			}
		}
		else{
			deleted=true;
		}
	}
	
	//Also reduce the count in countFile by 1 since 1 item has been deleted
	string count;
	getline(countFile, count);
	ofstream overwrite("count.txt", ofstream::trunc);
	overwrite<<to_string(stoi(count)-1)<<endl;
	overwrite.close();
	countFile.close();
	
	
	if(showMessage && deleted)//Do not show message if function is called by markDone function
		cout<<"Deleted todo #"<<id<<endl;
	else if(showMessage && !deleted)
		cout<<"Error: todo #"<<id<<" does not exist. Nothing deleted."<<endl;
	itemFile.close();
	temp.close();
	
	remove("data.txt");
	rename("temp.txt", "data.txt");
}

void markDone(char id){
	ifstream itemFile("data.txt");
	bool valid=false;
	//if list is empty we cannot mark item as completed
	if(isEmpty(itemFile)){
		cout<<"TODO List is empty"<<endl;
		itemFile.close();
		return;
	}
	
	//check if id is valid
	valid = checkValid(itemFile, id);
	if(!valid){
		cout<<"Error: todo #"<<id<<" does not exist."<<endl;
		itemFile.close();
		return;
	}
	
	itemFile.close();
	
	//otherwise increment count of completed items
	ifstream completed("completed.txt");
	string completedCount;
	getline(completed, completedCount);
	
	ofstream overwrite("completed.txt", ofstream::trunc);
	overwrite<<to_string(stoi(completedCount)+1);
	
	//show message
	cout<<"Marked todo #"<<id<<" as done."<<endl;
	//Delete the completed task from data file
	deleteItem(id,false);
	overwrite.close();
	completed.close();
}

void report(){
	ifstream completed("completed.txt");
	ifstream count("count.txt");
	
	string totalCount, complete;
	getline(count, totalCount);
	getline(completed, complete);
	
	string pendingCount = to_string(stoi(totalCount) - 1);
	if(stoi(pendingCount) < 0) pendingCount="0"; //handle negative value
	
	cout<<currentDateTime()<<" Pending : "<<pendingCount<<" Completed : "<<complete<<endl;
	
	completed.close();
	count.close();
}

int main(int argc, char* argv[])
{	
	//map for storing keywords
	map<string, int>m={ {"help", 0}, {"add", 1}, {"ls", 2}, {"del", 3}, {"done", 4}, {"report", 5}, {"reset", 6}};
	
	if(argc==1){//default -> NO arguments provided
		help();//show available commands
	}
	else{
		//extract the keyword index from CLI in map
		int key_idx = m[argv[1]];
		
		switch(key_idx){
			
			case 0:{//show help
				help();
				break;
			}
				
			case 1:{
				
				if(argc<=2){
					cout<<"Error: Missing todo string. Nothing added!"<<endl;
				}
				else{
					string item(argv[2]);//extract the item to be added
					addItem(item);
				}
				
				break;
			}
				
			case 2:{//SHOW TODO to the user
				showItems();
				break;
			}
			
			case 3:{//delete a TODO item
				if(argc<=2){
					cout<<"Error: Missing NUMBER for deleting todo."<<endl;
				}
				else{
					char id = *argv[2];
					deleteItem(id);
				}	
				break;
			}
			
			case 4:{// mark a TODO item as DONE
				if(argc<=2){
					cout<<"Error: Missing NUMBER for marking todo as done."<<endl;
				}
				else{
					char id = *argv[2];
					markDone(id);
				}
				
				break;
			}
			
			case 5:{// show REPORT
				report();
				break;
			}
			
			case 6:{//Reset the files to inital state for different test cases
				init();
			}
			
			default:
				cout<<"Please check syntax"<<endl;
				
		}
	}
    return 0;
}
