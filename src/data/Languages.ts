import { type LanguageConfig } from '@/app/types/Playground';

export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  javascript: {
    name: 'JavaScript',
    extension: '.js',
    icon: '📄',
    defaultCode: `// Hello World in JavaScript
console.log("Hello World!");

// 변수 선언
const message = "Welcome to Playground";
console.log(message);

// 배열과 반복문
const numbers = [1, 2, 3, 4, 5];
numbers.forEach(num => {
  console.log(num * 2);
});`,
    cheatSheet: [
      'const/let/var - 변수 선언',
      'function name() {} - 함수 선언',
      'array.map(item => item) - 배열 매핑',
      'object.key - 객체 접근',
      'if (condition) {} - 조건문',
      'for (let i = 0; i < n; i++) {} - 반복문',
      'async/await - 비동기 처리',
      'try/catch - 에러 처리',
    ],
  },
  python: {
    name: 'Python',
    extension: '.py',
    icon: '🐍',
    defaultCode: `# Hello World in Python
print("Hello World!")

# 변수 선언
message = "Welcome to Playground"
print(message)

# 리스트와 반복문
numbers = [1, 2, 3, 4, 5]
for num in numbers:
    print(num * 2)

# 딕셔너리
person = {"name": "Alice", "age": 30}
print(person["name"])`,
    cheatSheet: [
      'print() - 출력',
      'def function_name(): - 함수 선언',
      'for item in list: - 반복문',
      'if condition: - 조건문',
      'list.append() - 리스트 추가',
      'dict = {"key": "value"} - 딕셔너리',
      'with open() as f: - 파일 처리',
      'try/except - 에러 처리',
    ],
  },
  java: {
    name: 'Java',
    extension: '.java',
    icon: '☕',
    defaultCode: `// Hello World in Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
        
        String message = "Welcome to Playground";
        System.out.println(message);
        
        // 배열과 반복문
        int[] numbers = {1, 2, 3, 4, 5};
        for (int num : numbers) {
            System.out.println(num * 2);
        }
    }
}`,
    cheatSheet: [
      'public static void main() - 메인 메서드',
      'String variable - 문자열 선언',
      'int/double/boolean - 기본 타입',
      'for (int i = 0; i < n; i++) - 반복문',
      'if (condition) {} - 조건문',
      'ArrayList<T> list - 동적 배열',
      'HashMap<K, V> - 해시맵',
      'try/catch - 에러 처리',
    ],
  },
  cpp: {
    name: 'C++',
    extension: '.cpp',
    icon: '⚙️',
    defaultCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    cout << "Hello World!" << endl;
    
    string message = "Welcome to Playground";
    cout << message << endl;
    
    // 벡터와 반복문
    vector<int> numbers = {1, 2, 3, 4, 5};
    for (int num : numbers) {
        cout << num * 2 << endl;
    }
    
    return 0;
}`,
    cheatSheet: [
      '#include <iostream> - 입출력 라이브러리',
      'cout << - 출력',
      'cin >> - 입력',
      'int/string/bool - 기본 타입',
      'for (int i = 0; i < n; i++) - 반복문',
      'vector<T> v - 동적 배열',
      'if/else - 조건문',
      'try/catch - 에러 처리',
    ],
  },
  html: {
    name: 'HTML/CSS',
    extension: '.html',
    icon: '🌐',
    defaultCode: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        h1 {
            color: white;
            font-size: 48px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
    </style>
</head>
<body>
    <h1>Hello World!</h1>
</body>
</html>`,
    cheatSheet: [
      '<div> - 컨테이너',
      '<p> - 단락',
      '<h1>~<h6> - 제목',
      'class="name" - CSS 클래스',
      'id="name" - 고유 ID',
      'style="color: red;" - 인라인 스타일',
      '<form> - 폼',
      '<input> - 입력 필드',
    ],
  },
};
