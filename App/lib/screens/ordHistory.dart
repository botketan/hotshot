import 'package:flutter/material.dart';
import 'package:hotshot/widgets/histCard.dart';
// import 'package:hotshot/model/checkInfo.dart';
// import 'package:hotshot/model/checkHelper.dart';

class OrdHistory extends StatefulWidget {
  const OrdHistory({Key? key}) : super(key: key);

  @override
  State<OrdHistory> createState() => _OrdHistoryState();
}

class _OrdHistoryState extends State<OrdHistory> {
  // final List<int> count = [1, 1, 1, 1, 1];
  // var itemc = 0;
  // final List<int> price = [100, 200, 300, 400, 500];
  // var sum = 0;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Order History'),
        backgroundColor: const Color(0xff307A59),
        centerTitle: true,
      ),
      body: Container(
        color: Colors.teal[100],
        child: ListView(
            physics: BouncingScrollPhysics(),

          children: [

            ListView.separated(
                padding: EdgeInsets.symmetric(horizontal: 2),
                itemBuilder: (context, index) {
                  return HistCard(); //(data: widget.stat[index]
                },
                shrinkWrap: true,
                //scrollDirection: Axis.vertical,
                physics: NeverScrollableScrollPhysics(),
                separatorBuilder: (context, index) {
                  return SizedBox(
                    height: 10,
                  );
                },
                itemCount: 25
            ),


          ],
        ),
      ),



    );
  }
}