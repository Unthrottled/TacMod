package io.unthrottled.sogos.tacmod.pomodoro

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager
import java.util.*
import java.util.concurrent.Executor

class PomodoroPackage(
    private val executor: Executor
): ReactPackage {

    override fun createNativeModules(
            reactContext: ReactApplicationContext
    ): MutableList<NativeModule> =
            mutableListOf(PomodoroModule(reactContext, executor))

    override fun createViewManagers(
            reactContext: ReactApplicationContext
    ): MutableList<ViewManager<View, ReactShadowNode<*>>> =
            Collections.emptyList()
}
