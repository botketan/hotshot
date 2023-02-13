import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:hotshot/model/my_user.dart';
import 'package:hotshot/screens/authentication/customer/customer_sign_in.dart';
import 'package:hotshot/screens/home.dart';
import 'package:hotshot/screens/restHome.dart';
import 'package:hotshot/screens/shopkeeper_home.dart';
import 'package:hotshot/screens/shopkeeper_main_page.dart';
import 'package:hotshot/screens/shopkeeperhome.dart';
import 'package:hotshot/services/auth_service.dart';
import 'firebase_options.dart';
import 'package:provider/provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.light,
          colorSchemeSeed: const Color(0xff307A59)),
      // home: CustomerSignIn(),
      // home: RestHome(),
      home: ShopkeeperHomePage(),
    );
    // return StreamProvider<MyUser?>.value(
    //   value: AuthService().user,
    //   initialData: null,
    //   child: MaterialApp(
    //     debugShowCheckedModeBanner: false,
    //     title: 'Hotshot',
    //     theme: ThemeData(
    //         useMaterial3: true,
    //         brightness: Brightness.dark,
    //         colorSchemeSeed: const Color(0xff307A59)),
    //     home: const Home(
    //       title: 'Hotshot',
    //     ),
    //   ),
    // );
  }
}
