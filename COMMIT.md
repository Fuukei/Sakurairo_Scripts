<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [提交信息规范](#%E6%8F%90%E4%BA%A4%E4%BF%A1%E6%81%AF%E8%A7%84%E8%8C%83)
  - [页眉设置](#%E9%A1%B5%E7%9C%89%E8%AE%BE%E7%BD%AE)
    - [提交类型](#%E6%8F%90%E4%BA%A4%E7%B1%BB%E5%9E%8B)
    - [作用域](#%E4%BD%9C%E7%94%A8%E5%9F%9F)
    - [主题](#%E4%B8%BB%E9%A2%98)
  - [正文设置](#%E6%AD%A3%E6%96%87%E8%AE%BE%E7%BD%AE)
  - [页脚设置](#%E9%A1%B5%E8%84%9A%E8%AE%BE%E7%BD%AE)
    - [引用提交的问题](#%E5%BC%95%E7%94%A8%E6%8F%90%E4%BA%A4%E7%9A%84%E9%97%AE%E9%A2%98)
    - [Breaking changes](#breaking-changes)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# 提交信息规范
[Angular规范](https://zj-git-guide.readthedocs.io/zh_CN/latest/message/Angular%E6%8F%90%E4%BA%A4%E4%BF%A1%E6%81%AF%E8%A7%84%E8%8C%83)
```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```
 ## 页眉设置
页眉的格式指定为提交类型(type)、作用域(scope，可选)和主题(subject)
 ### 提交类型
 提交类型指定为下面其中一个：
build：对构建系统或者外部依赖项进行了修改
ci：对CI配置文件或脚本进行了修改
docs：对文档进行了修改
feat：增加新的特征
fix：修复bug
pref：提高性能的代码更改
refactor：既不是修复bug也不是添加特征的代码重构
style：不影响代码含义的修改，比如空格、格式化、缺失的分号等
test：增加确实的测试或者矫正已存在的测试
### 作用域
范围可以是任何指定提交更改位置的内容
### 主题
主题包括了对本次修改的简洁描述，有以下准则

使用命令式，现在时态：“改变”不是“已改变”也不是“改变了”
不要大写首字母
不在末尾添加句号
## 正文设置
和主题设置类似，使用命令式、现在时态

应该包含修改的动机以及和之前行为的对比
## 页脚设置
### 引用提交的问题
如果本次提交目的是修改issue的话，需要在页脚引用该issue

以关键字Closes开头，比如

```Closes #234```
如果修改了多个bug，以逗号隔开

```Closes #123, #245, #992```

### Breaking changes
不兼容修改指的是本次提交修改了不兼容之前版本的API或者环境变量

所有不兼容修改都必须在页脚中作为中断更改块提到，以BREAKING CHANGE:开头，后跟一个空格或者两个换行符，其余的信息就是对此次修改的描述，修改的理由和修改注释
```
BREAKING CHANGE: isolate scope bindings definition has changed and
    the inject option for the directive controller injection was removed.

    To migrate the code follow the example below:

    Before:

    。。。
    。。。

    After:

    。。。
    。。。

    The removed `inject` wasn't generaly useful for directives so there should be no code using it.
```