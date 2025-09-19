package com.alexliu07.classtimetable.complication

import android.content.ComponentName
import android.content.Context
import androidx.wear.watchface.complications.datasource.ComplicationDataSourceUpdateRequester
import androidx.work.Worker
import androidx.work.WorkerParameters

class UpdateComplicationWorker(appContext: Context, workerParams: WorkerParameters): Worker(appContext, workerParams) {
    override fun doWork(): Result {

        val componentName = ComponentName(applicationContext, MainComplicationService::class.java)
        val complicationUpdateRequester = ComplicationDataSourceUpdateRequester.create(applicationContext,componentName)

        repeat(5){
            Thread.sleep(60000)
            complicationUpdateRequester.requestUpdateAll()
        }

        // Indicate whether the work finished successfully with the Result
        return Result.success()
    }
}